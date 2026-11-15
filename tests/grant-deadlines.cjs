const assert = require('node:assert/strict');
const data = require('../data/grant_deadlines.json');
const { selectUpcoming, daysUntil, refresh } = require('../static/js/grant-deadlines.js');
const items = data.deadlines.map(d => ({ grantId:d.id, agency:d.agency, date:d.date, timezone:d.timezone, expiresAt:d.expires_at }));
const byId = id => items.find(d => d.grantId === id);
const select = date => selectUpcoming(items, new Date(date)).map(d => d.grantId);
assert.deepEqual(select('2026-11-15T11:41:12Z'), ['microsoft-aiei-cohort4','gsu-faculty','nsf-mri-2027']);
assert.equal(select('2026-12-01T02:00:00Z')[0], 'microsoft-aiei-cohort4'); // former cutoff no longer expires AIEI
assert.equal(select('2027-01-01T01:59:59Z')[0], 'microsoft-aiei-cohort4');
assert.deepEqual(select('2027-01-01T02:00:00Z'), ['gsu-faculty','nsf-mri-2027','nih-r21-feb-2027']);
assert.equal(select('2027-01-14T04:59:59Z')[0], 'gsu-faculty');
assert.deepEqual(select('2027-01-14T05:00:00Z'), ['nsf-mri-2027','nih-r21-feb-2027','nsf-career']);
assert.equal(select('2027-01-29T21:59:59Z')[0], 'nsf-mri-2027');
assert.deepEqual(select('2027-01-29T22:00:00Z'), ['nih-r21-feb-2027','nsf-career']);
assert.equal(select('2027-02-16T21:59:59Z')[0], 'nih-r21-feb-2027');
assert.deepEqual(select('2027-02-16T22:00:00Z'), ['nsf-career']);
assert.deepEqual(select('2027-07-28T21:00:00Z'), []);
assert.equal(daysUntil(byId('microsoft-aiei-cohort4'),new Date('2027-01-01T01:30:00Z')), 0); // still December 31 Pacific
assert.equal(daysUntil(byId('microsoft-aiei-cohort4'),new Date('2026-10-31T23:00:00Z')), 61); // DST fallback is not an extra calendar day
assert.deepEqual(selectUpcoming([...items].reverse(),new Date('2026-11-15T11:41:12Z')),items.slice(0,3));
assert.equal(new Set(items.map(d => d.grantId)).size, items.length);
assert(!items.some(d => ['amazon-fall-2026','nsf-ai-datasets-2026','simons-travel-2027','simons-empire-ai-2027','simons-math-ai-institutes-2027','simons-dissertation-2027','swiss-ai-small-compute','mitacs-g7-ai-mobility','gadrc-pilot-2027','taiwan-nstc-research-scholar-2027','olcf-discretionary','psc-neocortex','anton3-2026','canada-masters-2026','nih-r21','nsf-grfp','canada-postdoctoral-nserc-2026','nserc-discovery','alliance-rac-2027','nserc-alliance-international','nsf-ai-infrastructure-hubs','microsoft-quine-fellowship'].includes(d.grantId)), 'Exclude expired, student, rolling or unconfirmed prerequisite routes');
assert.equal(data.app_url,'https://chikuang.github.io/grant-radar/');
for (const d of data.deadlines) {
  assert(d.sources.length && d.timing && d.note);
  assert(Date.parse(d.expires_at)>Date.parse(data.reviewed+'T11:41:12Z'), 'No expired entries in the current faculty widget');
  for (const source of d.sources) assert.equal(new URL(source.url).protocol,'https:');
  assert.equal(new Date(d.date+'T12:00:00Z').toISOString().slice(0,10),d.date);
  assert(Number.isFinite(Date.parse(d.expires_at)));
}
const nodes = items.map(dataset => ({dataset:{...dataset},badge:{},classList:{toggle(){}},querySelector(){return this.badge;}}));
const empty = {}, summary = {};
const widget={querySelectorAll:()=>nodes,querySelector:selector=>selector==='[data-grant-summary]'?summary:selector==='[data-grant-empty]'?empty:{appendChild(){throw Error('Already sorted nodes should not be moved');}}};
refresh(widget,new Date('2026-11-15T11:41:12Z'));
assert.equal(nodes.filter(n=>!n.hidden).length,3);assert.equal(nodes[0].badge.textContent,'46 days');assert(summary.textContent.includes('Microsoft'));assert(summary.textContent.includes('46 days'));
refresh(widget,new Date('2027-01-01T02:00:00Z'));
assert(nodes[0].hidden);assert(!nodes[3].hidden);assert.equal(empty.hidden,true);
refresh(widget,new Date('2028-01-01T00:00:00Z'));assert(nodes.every(n=>n.hidden));assert.equal(empty.hidden,false);assert.equal(summary.textContent,'No confirmed upcoming dates');
console.log('PASS: extended deadline, next-three ordering, exact cutoffs, DST, Pacific date boundary, date-only expiry, rollover, empty state and public links.');
