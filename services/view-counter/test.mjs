import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

test('persistent total, concurrent views, safe retries, read-only requests and CORS', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'chikuang-counter-test-'));
  const options = {
    modules: true,
    scriptPath: fileURLToPath(new URL('./worker.js', import.meta.url)),
    compatibilityDate: '2026-09-19',
    bindings: { SITE_ORIGIN: 'https://chikuang.github.io', INITIAL_TOTAL: '42' },
    durableObjects: { COUNTER: { className: 'ViewCounter', useSQLite: true } },
    resourcePersistencePath: dir,
    telemetry: { enabled: false },
    cf: false
  };
  let mf = new Miniflare(convertV4MiniflareOptions(options));
  const read = async () => {
    const response = await mf.dispatchFetch('https://counter.test/views');
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*');
    assert.equal(response.status, 200);
    return (await response.json()).total;
  };
  const record = (eventId, overrides = {}) => mf.dispatchFetch('https://counter.test/views', {
    method: 'POST', headers: { Origin: 'https://chikuang.github.io', 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId }), ...overrides
  });
  try {
    assert.equal(await read(), 42);
    assert.equal(await read(), 42, 'Repeated reads must not count visits');
    const id = randomUUID();
    assert.equal((await (await record(id)).json()).total, 43);
    assert.equal((await (await record(id)).json()).total, 43, 'A retried event counts once');
    const concurrent = await Promise.all(Array.from({ length: 20 }, () => record(randomUUID())));
    for (const response of concurrent) assert.equal(response.status, 200);
    assert.equal(await read(), 63, 'Concurrent views must not overwrite one another');
    const duplicates = await Promise.all(Array.from({ length: 5 }, () => record(id)));
    for (const response of duplicates) assert.equal(response.status, 200);
    assert.equal(await read(), 63);
    assert.equal((await record(randomUUID(), { headers: { Origin: 'http://127.0.0.1:4321', 'Content-Type': 'application/json' } })).status, 403);
    assert.equal((await record(randomUUID(), { headers: { 'Content-Type': 'application/json' } })).status, 403);
    assert.equal((await record('not-a-uuid')).status, 400);
    assert.equal((await record(id, { body: 'x'.repeat(300) })).status, 400);
    assert.equal((await record(id, { body: '{broken' })).status, 400);
    assert.equal((await record(id, { headers: { Origin: 'https://chikuang.github.io', 'Content-Type': 'text/plain' } })).status, 415);
    assert.equal((await mf.dispatchFetch('https://counter.test/views', { method: 'DELETE' })).status, 405);
    assert.equal((await mf.dispatchFetch('https://counter.test/reset')).status, 404);
    const preflight = await mf.dispatchFetch('https://counter.test/views', { method: 'OPTIONS', headers: { Origin: 'https://chikuang.github.io', 'Access-Control-Request-Method': 'POST' } });
    assert.equal(preflight.status, 204);
    assert.equal(await read(), 63, 'Invalid requests and preflight must not count');
    await mf.dispose();
    mf = new Miniflare(convertV4MiniflareOptions({ ...options, bindings: { ...options.bindings, INITIAL_TOTAL: '9999' } }));
    assert.equal(await read(), 63, 'Runtime restart / redeploy must retain the stored total and ignore a new seed');
    assert.equal((await (await record(id)).json()).total, 63, 'Retry protection persists across restarts');
    assert.equal((await (await record(randomUUID())).json()).total, 64);
  } finally {
    await mf.dispose();
    await rm(dir, { recursive: true, force: true });
  }
});

test('aggregate geolocation, navigation deduplication, legacy clients and durable map storage', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'chikuang-map-test-'));
  const options = {
    modules: true, scriptPath: fileURLToPath(new URL('./worker.js', import.meta.url)),
    compatibilityDate: '2026-09-19',
    bindings: { SITE_ORIGIN: 'https://chikuang.github.io', INITIAL_TOTAL: '42' },
    durableObjects: { COUNTER: { className: 'ViewCounter', useSQLite: true } },
    resourcePersistencePath: dir, telemetry: { enabled: false }, cf: false
  };
  let mf = new Miniflare(convertV4MiniflareOptions(options));
  const read = async () => (await mf.dispatchFetch('https://counter.test/views')).json();
  const record = async (eventId, cf, extra = {}) => {
    const response = await mf.dispatchFetch('https://counter.test/views', {
      method: 'POST', headers: { Origin: 'https://chikuang.github.io', 'Content-Type': 'application/json', 'CF-IPCountry': 'JP' },
      body: JSON.stringify({ eventId, visitorMap: true, ...extra }),
      cf: cf || {country:'XX',latitude:null,longitude:null}
    });
    assert.equal(response.status, 200);
    return response.json();
  };
  try {
    const initial = await read();
    assert.equal(initial.total, 42);
    assert.equal(initial.map.visits, 0, 'Legacy totals are not invented map history');
    assert.deepEqual(initial.map.locations, []);
    const id = randomUUID();
    const us = {country:'US', latitude:'33.749', longitude:'-84.388'};
    let state = await record(id, us);
    assert.equal(state.total, 43);
    assert.equal(state.map.visits, 1);
    assert.deepEqual(state.map.locations, [{country:'US', latitude:35, longitude:-85, visits:1}]);
    const duplicate = await record(id, {country:'CA', latitude:'45.5', longitude:'-73.6'});
    assert.deepEqual(duplicate, state, 'Internal navigation or retries cannot relocate or duplicate a visit');
    await Promise.all([record(randomUUID(), us), record(randomUUID(), us)]);
    state = await record(randomUUID(), {country:'TW', latitude:'25.033', longitude:'121.565'});
    assert.equal(state.map.visits, 4);
    assert.equal(state.map.locations.find(l => l.country === 'US').visits, 3);
    assert.deepEqual(state.map.locations.find(l => l.country === 'TW'), {country:'TW',latitude:25,longitude:120,visits:1});
    state = await record(randomUUID(), undefined, {country:'FR',latitude:48.8,longitude:2.3});
    assert.equal(state.map.visits, 5);
    assert.equal(state.map.locations.length, 2, 'Neither client payload nor CF-IPCountry headers can spoof edge location');
    for (const cf of [{country:'XX',latitude:0,longitude:0},{country:'US',latitude:'',longitude:0},{country:'US',latitude:91,longitude:0},{country:'US',latitude:0,longitude:181},{country:'US',latitude:'NaN',longitude:0}]) {
      state = await record(randomUUID(), cf);
    }
    assert.equal(state.map.locations.length, 2, 'Invalid locations never appear on the map');
    const beforeLegacy = state;
    state = await record(randomUUID(), us, {visitorMap:false});
    assert.equal(state.total, beforeLegacy.total + 1, 'Old clients retain the cumulative total');
    assert.deepEqual(state.map, beforeLegacy.map, 'Old per-page counts are excluded from session-based map statistics');
    assert.deepEqual(await read(), state, 'Polling is read-only for both totals and locations');
    await mf.dispose();
    mf = new Miniflare(convertV4MiniflareOptions(options));
    assert.deepEqual(await read(), state, 'Map and total survive redeploys without reinitializing');
    assert.deepEqual(await record(id, us), state);
    assert.ok(!JSON.stringify(state).includes(id), 'The public response never exposes event IDs');
  } finally {
    await mf.dispose();
    await rm(dir, {recursive:true,force:true});
  }
});
