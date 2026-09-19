const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'static/js/visitor-counter.js'), 'utf8');
const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'data/view_count.json'), 'utf8'));
const cachedDate = snapshot.updated;
function counterHarness({host = snapshot.host, port = '', cache = null, denyStorage = false} = {}) {
  const scripts = [], timers = new Map(), events = {}, pageEvents = {}, writes = [];
  let timerId = 0;
  const attrs = {'data-counter-host': snapshot.host, 'data-counter-total': String(snapshot.total), 'data-counter-updated': snapshot.updated};
  const counter = {title: '', getAttribute: name => attrs[name]};
  const value = {textContent: String(snapshot.total), attrs: {}, setAttribute(k,v) { this.attrs[k] = v; }};
  const status = {textContent: ''};
  const storage = {getItem: () => cache, setItem(key, value) { writes.push(JSON.parse(value)); }};
  const window = {location: {hostname: host, port}, addEventListener: (k,f) => pageEvents[k] = f,
    setTimeout(f, ms) {timers.set(++timerId, {f,ms}); return timerId;}, clearTimeout: id => timers.delete(id)};
  Object.defineProperty(window, 'localStorage', {get() {if (denyStorage) throw new Error('Storage denied'); return storage;}});
  const document = {
    getElementById: id => ({'site-visitor-count': counter, 'site-view-count': value, 'site-view-status': status})[id],
    addEventListener: (k,f) => events[k] = f,
    createElement: () => ({remove() { this.removed = true; }}),
    head: {appendChild: el => scripts.push(el)}
  };
  vm.runInNewContext(source, {window, document});
  const reply = (index, data) => window[new URL(scripts[index].src).searchParams.get('jsonpCallback')](data);
  return {window,counter,value,status,scripts,timers,events,pageEvents,reply,writes};
}
for (const options of [{host:'127.0.0.1',port:'4321'}, {port:'4321'}]) {
  const h = counterHarness(options);
  assert.equal(h.value.textContent, String(snapshot.total));
  assert.match(h.status.textContent, /preview.*saved/);
  assert.equal(h.scripts.length, 0);
}
let h = counterHarness();
assert.equal(h.value.textContent, String(snapshot.total), 'First visit shows published total before any response');
assert.match(h.status.textContent, /saved/);
assert.equal(h.scripts.length, 1);
assert.equal(h.scripts[0].referrerPolicy, 'strict-origin-when-cross-origin');
h.scripts[0].onerror();
assert.equal(h.value.textContent, String(snapshot.total), 'Blocking must not erase the total');
assert.match(h.status.textContent, /saved/);
assert.match(h.counter.title, /blocked/);
assert.equal(h.value.attrs['aria-busy'], 'false');
assert.equal(h.scripts.length, 1, 'Do not retry a possibly recorded increment');

h = counterHarness();
h.reply(0, {site_pv: 1234, site_uv: 7});
assert.equal(h.value.textContent, '1,234');
assert.equal(h.status.textContent, '');
assert.equal(h.writes[0].total, 1234);
assert.equal(h.value.attrs['aria-busy'], 'false');
h.events['site:pageview'](); h.events['site:pageview']();
h.reply(2, {site_pv: 1236}); h.reply(1, {site_pv: 1235});
assert.equal(h.value.textContent, '1,236', 'Out-of-order responses cannot lower the total');
assert.equal(h.writes.at(-1).total, 1236);
h.pageEvents.pageshow({persisted: false});
assert.equal(h.scripts.length, 3);
h.pageEvents.pageshow({persisted: true});
assert.equal(h.scripts.length, 4);
h.scripts[3].onerror();
assert.equal(h.value.textContent, '1,236');
assert.match(h.status.textContent, /saved/);
h.events['site:pageview'](); h.reply(4, {site_pv: 1});
assert.equal(h.value.textContent, '1,236');
assert.match(h.status.textContent, /saved/, 'A lower service total must not be labeled current');

h = counterHarness({cache: JSON.stringify({total: 1234, updated: cachedDate})});
h.scripts[0].onerror();
assert.equal(h.value.textContent, '1,234', 'Reloads retain previously fetched data when now blocked');
assert.match(h.status.textContent, /saved/);
for (const cache of ['broken JSON', JSON.stringify({total:-1,updated:cachedDate}), JSON.stringify({total:9000,updated:123}), JSON.stringify({total:9000,updated:'2099-01-01T00:00:00Z'}), JSON.stringify({total:1,updated:cachedDate})]) {
  h = counterHarness({cache});
  assert.equal(h.value.textContent, String(snapshot.total), 'Invalid or lower cache cannot replace snapshot');
}
h = counterHarness({denyStorage: true});
h.scripts[0].onerror();
assert.equal(h.value.textContent, String(snapshot.total));
h.events['site:pageview'](); h.reply(1, {site_pv: 1234});
assert.equal(h.value.textContent, '1,234', 'Private/storage-denied mode can still show live responses');

for (const data of [{site_uv: 7}, {site_pv:'9000'}, {site_pv:-1}, {site_pv:1.5}, {site_pv:NaN}]) {
  h = counterHarness(); h.reply(0, data);
  assert.equal(h.value.textContent, String(snapshot.total));
  assert.match(h.status.textContent, /saved/);
}
h = counterHarness();
[...h.timers.values()].find(t => t.ms === 15000).f();
assert.equal(h.value.textContent, String(snapshot.total));
h.reply(0, {site_pv: 9000});
assert.equal(h.value.textContent, String(snapshot.total), 'Late timed-out callback must be harmless');

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
console.log('Passed: saved HTML total, blocked requests, cache/reloads, denied storage, invalid data, preview isolation, live PV, section navigation, duplicate prevention, response ordering, errors and timeouts.');
