const assert = require('node:assert/strict');
const data = require('../data/academic_events.json');
const { todayInZone, bucketFor, compareEvents, refresh } = require('../static/js/academic-events.js');
const zone = data.timezone;
const day = value => todayInZone(new Date(value), zone);

// Inclusive final days, UTC vs Atlanta, both DST transitions, and year rollover.
assert.equal(day('2026-10-06T03:59:59Z'), '2026-10-05');
assert.equal(day('2026-10-06T04:00:00Z'), '2026-10-06');
assert.equal(day('2026-03-08T06:59:59Z'), '2026-03-08');
assert.equal(day('2026-03-08T07:00:00Z'), '2026-03-08');
assert.equal(day('2026-11-02T04:59:59Z'), '2026-11-01');
assert.equal(day('2026-11-02T05:00:00Z'), '2026-11-02');
assert.equal(day('2027-01-01T04:59:59Z'), '2026-12-31');
const neurips = data.events.find(e => e.id === 'neurips-atlanta-2026');
assert.equal(bucketFor(neurips, '2026-12-09'), 'research');
assert.equal(bucketFor(neurips, '2026-12-13'), 'research');
assert.equal(bucketFor(neurips, '2026-12-14'), 'past');
const pending = data.events.find(e => !e.end);
assert.equal(bucketFor(pending, '2030-01-01'), 'pending');
assert.equal(bucketFor(data.events.find(e => e.id === 'mlsp-2026'), '2026-10-04'), 'past');

// Reject malformed dates, duplicate records, missing sources, and unknown categories.
function validDate(value) {
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Date(value + 'T12:00:00Z').toISOString().slice(0, 10), value);
}
const categories = data.categories.map(c => c.id);
assert.equal(new Set(data.events.map(e => e.id)).size, data.events.length);
validDate(data.last_reviewed);
for (const event of data.events) {
  assert(categories.includes(event.category));
  assert(event.title && event.description && event.location && event.id);
  assert.equal(new URL(event.url).protocol, 'https:');
  validDate(event.verified);
  if (event.start || event.end) {
    validDate(event.start); validDate(event.end);
    assert(event.start <= event.end, event.id + ': reversed dates');
  } else assert(event.date_note);
  for (const deadline of event.deadlines || []) validDate(deadline.date);
}
const ordered = [...data.events].filter(e => e.start).sort((a, b) => compareEvents(a, b, 'research'));
assert(ordered.every((e, i) => !i || ordered[i - 1].start <= e.start));

// Exercise the actual DOM updater through midnight, including the archive page's
// hidden upcoming pool, deadline expiry, and idempotency (nodes must never duplicate).
function directory(mode) {
  const nodes = data.events.map(e => ({ dataset: { ...e }, querySelector: () => ({ textContent: e.title }) }));
  const lists = new Map([...categories, 'pending', 'past'].map(key => [key, {
    dataset: { eventList: key }, children: [],
    appendChild(node) {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
      this.children.push(node); node.parent = this;
    }
  }]));
  const empty = new Map([...lists.keys()].map(key => [key, {}]));
  const deadlines = [{ dataset: { deadline: '2026-10-09' } }];
  const count = {}, label = {};
  return {
    dataset: { timezone: zone, mode }, lists, deadlines, count, nodes,
    querySelectorAll(selector) {
      return { '[data-event-list]': [...lists.values()], '[data-event-id]': nodes,
        '[data-deadline]': deadlines }[selector];
    },
    querySelector(selector) {
      if (selector === '[data-past-count]') return count;
      if (selector === '[data-event-date-label]') return label;
      return empty.get(selector.match(/data-empty-for="([^"]+)"/)[1]);
    }
  };
}
for (const mode of ['upcoming', 'past']) {
  const page = directory(mode);
  refresh(page, new Date('2026-10-06T03:59:59Z'));
  const event = page.nodes.find(n => n.dataset.id === 'georgia-statistics-day-2026');
  assert.equal(event.parent.dataset.eventList, 'research');
  refresh(page, new Date('2026-10-06T04:00:00Z'));
  assert.equal(event.parent.dataset.eventList, 'past');
  refresh(page, new Date('2026-10-06T04:01:00Z'));
  assert.equal([...page.lists.values()].reduce((n, l) => n + l.children.length, 0), data.events.length);
  refresh(page, new Date('2026-10-10T04:00:00Z'));
  assert.equal(page.deadlines[0].hidden, true);
  refresh(page, new Date('2028-01-01T12:00:00Z'));
  assert.equal(page.lists.get('pending').children.length, 1);
  assert.equal(page.lists.get('past').children.length, data.events.length - 1);
}
console.log(`Validated ${data.events.length} events; date boundaries, DST, archive transfers, sorting, deadlines and repeat refresh passed.`);
