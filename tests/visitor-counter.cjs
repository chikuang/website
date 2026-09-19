const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(__dirname, '../static/js/visitor-counter.js'), 'utf8');
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

function harness({ preview = false } = {}) {
  const requests = [], timers = new Map(), intervals = [], events = {}, pageEvents = {};
  let timerId = 0;
  const attrs = { 'data-counter-host': 'chikuang.github.io', 'data-counter-endpoint': 'https://counter.example/views' };
  const counter = { title: '', getAttribute: key => attrs[key] };
  const value = { textContent: '42' }, status = { textContent: ' (saved 2026-09-19)' };
  const window = {
    location: { hostname: preview ? '127.0.0.1' : 'chikuang.github.io', port: preview ? '4321' : '' },
    crypto: webcrypto,
    setTimeout(f, ms) { timers.set(++timerId, { f, ms }); return timerId; },
    clearTimeout(id) { timers.delete(id); }, setInterval(f, ms) { intervals.push({ f, ms }); },
    addEventListener(name, f) { pageEvents[name] = f; }
  };
  // Counter operation must not depend on browser storage or third-party cookies.
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage denied'); } });
  const document = { hidden: false,
    getElementById: id => ({ 'site-visitor-count': counter, 'site-view-count': value, 'site-view-status': status })[id],
    addEventListener(name, f) { events[name] = f; }
  };
  const fetch = (url, options) => new Promise((resolve, reject) => {
    requests.push({ url, options, resolve, reject });
    options.signal.addEventListener('abort', () => reject(new Error('Aborted')));
  });
  vm.runInNewContext(source, { window, document, fetch, AbortController });
  const reply = async (index, data) => {
    requests[index].resolve({ ok: true, json: async () => data }); await flush();
  };
  const fail = async index => { requests[index].reject(new Error('Network failure')); await flush(); };
  const timer = async ms => {
    const entry = [...timers].find(([, t]) => t.ms === ms);
    assert.ok(entry, `Expected timer ${ms}`); timers.delete(entry[0]); entry[1].f(); await flush();
  };
  return { window, document, counter, value, status, requests, intervals, events, pageEvents, reply, fail, timer };
}

(async () => {
  let h = harness();
  assert.equal(h.value.textContent, '—', 'Never present the old fixed snapshot as live');
  assert.equal(h.requests[0].options.method, 'POST');
  assert.equal(h.requests[0].options.credentials, 'omit');
  assert.equal(h.requests[0].options.cache, 'no-store');
  const firstId = JSON.parse(h.requests[0].options.body).eventId;
  assert.match(firstId, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  await h.reply(0, { total: 43 });
  assert.equal(h.value.textContent, '43');
  assert.equal(h.status.textContent, '');
  assert.equal(h.intervals[0].ms, 30000);
  h.intervals[0].f(); await flush();
  assert.equal(h.requests[1].options.method, 'GET', 'Polling must never increment');
  assert.equal(h.requests[1].options.body, undefined);
  await h.reply(1, { total: 45 });
  assert.equal(h.value.textContent, '45', 'Reads display views recorded by other browsers');
  h.document.hidden = true; h.intervals[0].f(); await flush();
  assert.equal(h.requests.length, 2, 'Background tabs do not poll');
  h.document.hidden = false; h.events.visibilitychange(); await flush();
  assert.equal(h.requests[2].options.method, 'GET'); await h.reply(2, { total: 45 });
  h.events['site:pageview'](); await flush();
  assert.equal(h.requests[3].options.method, 'POST');
  assert.notEqual(JSON.parse(h.requests[3].options.body).eventId, firstId);
  await h.reply(3, { total: 46 });
  h.pageEvents.pageshow({ persisted: false }); assert.equal(h.requests.length, 4);
  h.pageEvents.pageshow({ persisted: true }); await flush(); await h.reply(4, { total: 47 });

  h = harness();
  await h.timer(15000);
  assert.match(h.status.textContent, /unavailable/);
  await h.timer(2000);
  assert.equal(h.requests[1].options.body, h.requests[0].options.body, 'Timeout retry uses the same event ID');
  await h.fail(1); await h.timer(4000);
  assert.equal(h.requests[2].options.body, h.requests[0].options.body);
  await h.fail(2);
  assert.equal(h.requests.length, 3, 'Retries are bounded');
  assert.equal(h.value.textContent, '—');
  h.pageEvents.online(); await flush();
  assert.equal(h.requests[3].options.method, 'GET');
  await h.reply(3, { total: 1000 }); assert.equal(h.value.textContent, '1,000');
  h.intervals[0].f(); await flush(); await h.fail(4);
  assert.equal(h.value.textContent, '1,000'); assert.match(h.status.textContent, /offline/);

  h = harness({ preview: true });
  assert.equal(h.requests[0].options.method, 'GET');
  await h.reply(0, { total: 60 });
  assert.match(h.status.textContent, /preview/);
  h.events['site:pageview'](); h.pageEvents.pageshow({ persisted: true }); await flush();
  assert.equal(h.requests.length, 1, 'Preview visits never count');
  for (const data of [{ total: '100' }, { total: -1 }, { total: 60.5 }, { total: 10 }, {}]) {
    h.intervals[0].f(); await flush(); await h.reply(h.requests.length - 1, data);
    assert.equal(h.value.textContent, '60'); assert.match(h.status.textContent, /offline/);
  }
  h = harness(); h.events['site:pageview'](); await flush();
  await h.reply(1, { total: 90 }); await h.reply(0, { total: 89 });
  assert.equal(h.value.textContent, '90', 'Out-of-order responses never lower the count');
  assert.equal(h.status.textContent, '');
  const mainSource = fs.readFileSync(path.join(root, 'themes/avicenna/static/js/main.js'), 'utf8');
  const emitted = [], listeners = {}, domEvents = {};
  const keys = ['home','publications','softwares','teaching','group','resources'];
  const tabs = keys.map(key => ({href: '', events: {}, getAttribute: () => key, setAttribute() {}, removeAttribute() {},
    classList: {toggle() {}}, addEventListener(k,f) {this.events[k]=f;}, focus() {}}));
  const panels = keys.map(key => ({getAttribute: name => name === 'data-panel-key' ? key : key, setAttribute() {}}));
  const content = {querySelectorAll: () => panels, getAttribute: name => ({'data-default-panel':'home','data-home-url':'/','data-site-title':'Profile','data-home-title':'Home'})[name]};
  const tablist = {querySelectorAll: () => tabs, setAttribute() {}};
  const window = {location: {hash: ''}, history: {pushState(a,b,url) {window.location.hash = '#' + url.split('#')[1];}}, addEventListener: (k,f) => listeners[k]=f};
  const document = {readyState:'loading', querySelector: selector => selector === '[data-site-panels]' ? content : selector === '[data-site-tabs]' ? tablist : null,
    getElementById: () => null, addEventListener: (k,f) => domEvents[k]=f, dispatchEvent: e => emitted.push(e.type), documentElement: {getAttribute: () => 'light', setAttribute() {}}};
  vm.runInNewContext(mainSource, {window, document, localStorage:{getItem:()=>null,setItem(){}}, Event:class {constructor(type){this.type=type;}}});
  domEvents.DOMContentLoaded();
  assert.equal(emitted.length, 0, 'Initial section must not double count initial page load');
  const click = index => tabs[index].events.click({button:0,preventDefault(){}});
  click(0); assert.equal(emitted.length, 0);
  click(1); assert.deepEqual(emitted, ['site:pageview']);
  click(1); assert.equal(emitted.length, 1);
  click(2); assert.equal(emitted.length, 2);
  window.location.hash = '#publications'; listeners.popstate(); assert.equal(emitted.length, 3);
  listeners.hashchange(); assert.equal(emitted.length, 3, 'Duplicate browser events must not double count');

  console.log('Passed: real totals, read-only polling, preview isolation, denied storage, per-view IDs, safe bounded retries, background tabs, navigation, offline recovery and invalid responses.');
})().catch(error => { console.error(error); process.exitCode = 1; });
