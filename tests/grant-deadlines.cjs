const assert = require('node:assert/strict');
const data = require('../data/grant_deadlines.json');
const { selectUpcoming, daysUntil, refresh } = require('../static/js/grant-deadlines.js');
const items = data.deadlines.map(d => ({ grantId:d.id, agency:d.agency, date:d.date, timezone:d.timezone, expiresAt:d.expires_at }));
const select = date => selectUpcoming(items, new Date(date)).map(d => d.grantId);
assert.deepEqual(select('2026-10-04T20:00:00Z'), ['nih-r21','amazon-fall-2026','gsu-faculty']);
assert.deepEqual(select('2026-10-16T20:59:59Z'), ['nih-r21','amazon-fall-2026','gsu-faculty']);
assert.deepEqual(select('2026-10-16T21:00:00Z'), ['amazon-fall-2026','gsu-faculty','nsf-career']);
assert.equal(select('2026-11-05T07:58:59Z')[0], 'amazon-fall-2026');
assert.equal(select('2026-11-05T07:59:00Z')[0], 'gsu-faculty');
assert.equal(select('2027-01-14T04:59:59Z')[0], 'gsu-faculty');
assert.deepEqual(select('2027-01-14T05:00:00Z'), ['nsf-career']);
assert.deepEqual(select('2027-07-28T21:00:00Z'), []);
assert.equal(daysUntil(items[1],new Date('2026-11-05T07:30:00Z')), 0); // still Nov 4 Pacific
assert.equal(daysUntil(items[1],new Date('2026-10-31T23:00:00Z')), 4); // DST fallback is not an extra calendar day
assert.equal(daysUntil(items[0],new Date('2026-10-16T03:30:00Z')), 1); // Atlanta is still Oct 15
assert.deepEqual(selectUpcoming([...items].reverse(),new Date('2026-10-04T20:00:00Z')),items.slice(0,3));
assert.equal(new Set(items.map(d => d.grantId)).size, items.length);
assert.equal(data.app_url,'https://chikuang.github.io/grant-radar/');
for (const d of data.deadlines) {
  assert(d.sources.length && d.timing && d.note);
  for (const source of d.sources) assert.equal(new URL(source.url).protocol,'https:');
  assert.equal(new Date(d.date+'T12:00:00Z').toISOString().slice(0,10),d.date);
  assert(Number.isFinite(Date.parse(d.expires_at)));
}
const nodes = items.map(dataset => ({dataset:{...dataset},badge:{},classList:{toggle(){}},querySelector(){return this.badge;}}));
const empty = {}, summary = {};
const widget={querySelectorAll:()=>nodes,querySelector:selector=>selector==='[data-grant-summary]'?summary:selector==='[data-grant-empty]'?empty:{appendChild(){throw Error('Already sorted nodes should not be moved');}}};
refresh(widget,new Date('2026-10-04T20:00:00Z'));
assert.equal(nodes.filter(n=>!n.hidden).length,3);assert.equal(nodes[0].badge.textContent,'12 days');assert(summary.textContent.includes('NIH R21'));assert(summary.textContent.includes('12 days'));
refresh(widget,new Date('2026-10-16T21:00:00Z'));
assert(nodes[0].hidden);assert(!nodes[3].hidden);assert.equal(empty.hidden,true);
refresh(widget,new Date('2028-01-01T00:00:00Z'));assert(nodes.every(n=>n.hidden));assert.equal(empty.hidden,false);assert.equal(summary.textContent,'No confirmed upcoming dates');
console.log('PASS: next-three ordering, exact cutoffs, DST, Pacific midnight, date-only expiry, rollover, empty state, public links.');
