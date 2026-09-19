import { DurableObject } from 'cloudflare:workers';

// Stable identity: changing this name would create a separate, empty counter.
const COUNTER_NAME = 'chikuang.github.io:all-time-views';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ViewCounter extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    const initial = Number(env.INITIAL_TOTAL);
    if (!Number.isSafeInteger(initial) || initial < 0) throw new Error('Invalid initial total');
    this.sql = ctx.storage.sql;
    this.sql.exec('CREATE TABLE IF NOT EXISTS totals (id INTEGER PRIMARY KEY CHECK (id = 1), total INTEGER NOT NULL)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY)');
    // Seed once, never on redeploy or when the instance wakes up.
    this.sql.exec('INSERT OR IGNORE INTO totals (id, total) VALUES (1, ?)', initial);
  }

  read() {
    return { total: this.sql.exec('SELECT total FROM totals WHERE id = 1').one().total };
  }

  record(eventId) {
    if (!UUID.test(eventId)) throw new Error('Invalid event ID');
    return this.ctx.storage.transactionSync(() => {
      const inserted = this.sql.exec('INSERT OR IGNORE INTO events (id) VALUES (?) RETURNING id', eventId).toArray();
      if (inserted.length) this.sql.exec('UPDATE totals SET total = total + 1 WHERE id = 1');
      return this.read();
    });
  }
}

async function readEvent(request) {
  if (!request.body) throw new Error('Missing event');
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 256) throw new Error('Event too large');
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const data = JSON.parse(new TextDecoder().decode(bytes));
  if (!data || typeof data.eventId !== 'string' || !UUID.test(data.eventId)) throw new Error('Invalid event');
  return data.eventId;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Content-Type-Options': 'nosniff'
    };
    const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });
    if (new URL(request.url).pathname !== '/views') return reply({ error: 'Not found' }, 404);
    if (request.method === 'OPTIONS') {
      if (origin !== env.SITE_ORIGIN) return reply({ error: 'Origin not allowed' }, 403);
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== 'GET' && request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
    if (request.method === 'POST' && origin !== env.SITE_ORIGIN) return reply({ error: 'Origin not allowed' }, 403);
    let eventId;
    if (request.method === 'POST') {
      if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') {
        return reply({ error: 'Expected JSON' }, 415);
      }
      try { eventId = await readEvent(request); }
      catch { return reply({ error: 'Invalid event' }, 400); }
    }
    try {
      const counter = env.COUNTER.getByName(COUNTER_NAME);
      const result = eventId ? await counter.record(eventId) : await counter.read();
      return reply(result);
    } catch {
      return reply({ error: 'Temporarily unavailable' }, 503);
    }
  }
};
