import { DurableObject } from 'cloudflare:workers';

// Stable identity: changing this name would create a separate, empty counter.
const COUNTER_NAME = 'chikuang.github.io:all-time-views';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function approximateLocation(cf) {
  if (!cf || !/^[A-Z]{2}$/.test(cf.country) || cf.country === 'XX') return null;
  if (cf.latitude == null || cf.longitude == null || cf.latitude === '' || cf.longitude === '') return null;
  const latitude = Number(cf.latitude), longitude = Number(cf.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  // Store only aggregate 5-degree regions, never IPs or precise coordinates.
  return { country: cf.country, latitude: Math.round(latitude / 5) * 5, longitude: Math.round(longitude / 5) * 5 };
}

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
    this.sql.exec('CREATE TABLE IF NOT EXISTS map_totals (id INTEGER PRIMARY KEY CHECK (id = 1), since TEXT NOT NULL, visits INTEGER NOT NULL)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS visitor_locations (country TEXT NOT NULL, latitude INTEGER NOT NULL, longitude INTEGER NOT NULL, visits INTEGER NOT NULL, PRIMARY KEY (country, latitude, longitude))');
    this.sql.exec('INSERT OR IGNORE INTO map_totals (id, since, visits) VALUES (1, ?, 0)', new Date().toISOString().slice(0, 10));
  }

  read() {
    return {
      total: this.sql.exec('SELECT total FROM totals WHERE id = 1').one().total,
      map: {
        ...this.sql.exec('SELECT since, visits FROM map_totals WHERE id = 1').one(),
        locations: this.sql.exec('SELECT country, latitude, longitude, visits FROM visitor_locations ORDER BY country, latitude, longitude').toArray()
      }
    };
  }

  record(eventId, trackMap = false, location = null) {
    if (!UUID.test(eventId)) throw new Error('Invalid event ID');
    return this.ctx.storage.transactionSync(() => {
      const inserted = this.sql.exec('INSERT OR IGNORE INTO events (id) VALUES (?) RETURNING id', eventId).toArray();
      if (inserted.length) {
        this.sql.exec('UPDATE totals SET total = total + 1 WHERE id = 1');
        if (trackMap) {
          this.sql.exec('UPDATE map_totals SET visits = visits + 1 WHERE id = 1');
          if (location) {
            this.sql.exec('INSERT INTO visitor_locations (country, latitude, longitude, visits) VALUES (?, ?, ?, 1) ON CONFLICT (country, latitude, longitude) DO UPDATE SET visits = visits + 1', location.country, location.latitude, location.longitude);
          }
        }
      }
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
  return { eventId: data.eventId, trackMap: data.visitorMap === true };
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
    let event;
    if (request.method === 'POST') {
      if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') {
        return reply({ error: 'Expected JSON' }, 415);
      }
      try { event = await readEvent(request); }
      catch { return reply({ error: 'Invalid event' }, 400); }
    }
    try {
      const counter = env.COUNTER.getByName(COUNTER_NAME);
      // Location comes only from trusted edge metadata, never client JSON or headers.
      const result = event ? await counter.record(event.eventId, event.trackMap, approximateLocation(request.cf)) : await counter.read();
      return reply(result);
    } catch {
      return reply({ error: 'Temporarily unavailable' }, 503);
    }
  }
};
