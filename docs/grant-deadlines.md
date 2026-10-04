# Grant Radar homepage widget

The Home panel contains a native details/summary dropdown, closed by default.
Its heading shows a custom kawaii calendar emoji and the nearest deadline; opening
it reveals the full three-item list and the Open app link. Keyboard Enter/Space
toggles the native control without JavaScript.

The Home panel displays the next three public faculty funding deadlines, ordered
by their cutoff. Every title and the Open app link opens the existing private
Grant Radar workspace through `https://chikuang.github.io/grant-radar/`;
its usual sign-in and access rules still apply. The widget
never requests profile data, proposal notes, tracked items, or private reminders.
It is a public opportunity list, not a synchronized view of saved proposals.

`data/grant_deadlines.json` is the reviewed public subset of Grant Radar's curated
catalog. Update this file when funding calls change, then rebuild Hugo and publish
the corresponding output. The widget recomputes upcoming dates on page load,
once per minute while visible, and when returning to the page. It does not search
for new calls or automatically import catalog changes from the private app.

Only announced faculty deadlines are included. Rolling programs, unannounced
cycles, student-only awards, and calls requiring an unmet earlier application
stage are excluded. Amazon's two Fall 2026 tracks are grouped because a PI can
submit one proposal per call period. Eligibility still depends on each call.

For each record:

- `date` is the official calendar day in `timezone` (an IANA time zone).
- `expires_at` is the confirmed cutoff converted to UTC. Daylight saving time
  must be considered for that particular date, not today's offset.
- For `date_only: true`, `expires_at` is the start of the next day in the funder's
  zone, solely for removing the card. It is **not** an asserted submission time;
  the visible timing must tell readers to confirm the cutoff.
- Keep official source links and the overall `reviewed` date current. Never
  extrapolate an annual deadline when the next call has not been announced.

Hugo renders an initial selection for readers without JavaScript and labels it
as the latest build's snapshot. JavaScript removes expired cards, promotes the
next known date, and shows an empty message when the reviewed list is exhausted.
It never fabricates replacement deadlines just to fill three rows.

Run `node tests/grant-deadlines.cjs` for cutoff, ordering, and date-zone checks.
Build into a temporary directory with `hugo --destination /absolute/temp/path`.
Publish relevant generated pages plus `css/grant-deadlines.css` and
`js/grant-deadlines.js`; preserve the separately maintained courses and CV files.

The original transparent mascot was generated with the built-in image generation
tool. Its optimized 160px PNG is `static/images/grant-radar-kawaii.png`.

## Short entry URL

`static/grant-radar/index.html` publishes the stable entry address
`https://chikuang.github.io/grant-radar/`. It forwards to the existing private
Sites app with `location.replace`, and includes an HTML refresh and a normal
link as fallbacks. The browser address changes to the app's hosting address.
The redirect target is fixed; query strings and fragments cannot override it.

This is an entry link, not a migration of the application or its database.
GitHub Pages serves the public website; the existing backend continues to
provide sign-in, saved profiles and proposals, search, reminders, and calendars.
When publishing this change, include the generated `grant-radar/index.html`
alongside the six pages containing the homepage widget.
