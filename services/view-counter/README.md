# Persistent live view counter

Deployed in the site owner's Cloudflare account on September 19, 2026:

- Production: https://chikuang-site-views.chikuang-site-views.workers.dev/views
- Staging: https://chikuang-site-views-staging.chikuang-site-views.workers.dev/views

The production endpoint is configured in `../../data/view_count.json`.
Publishing the rebuilt GitHub Pages output activates it on the public website.

The Worker stores one all-time total in a SQLite Durable Object. `GET /views`
reads the total; `POST /views` records one UUID-identified view. Repeating a POST
with the same event ID is safe, including after a restart. The browser keeps a
random visit ID in first-party `sessionStorage` for the lifetime of its tab, so
navigation across articles, reloads, and retries reuse one ID. Closing the tab
normally ends that session; a duplicated tab may inherit its opener's ID.
The application never stores IP addresses, precise coordinates, or page history.
Cloudflare still handles network requests.

The frontend reads the total every 30 seconds while visible. Embedded-section
changes and back/forward cache restorations only read. Full page loads reuse
the tab's ID; the backend atomically deduplicates them. If session storage is
blocked, same-site referrers and browser navigation timing suppress increments
on internal navigation, reloads, and history traversal. With storage and both
navigation signals unavailable, complete cross-document deduplication is not
possible. No third-party cookies or persistent local-storage IDs are used.
Local previews only read the total. Failed requests are marked unavailable or
offline; the frontend never substitutes a fixed snapshot or invented increment.

## Visitor map

`GET /views` also returns `map: {since, visits, locations}`. New clients send
`visitorMap: true`; only newly counted IDs from those clients contribute to the
map. This keeps old per-page clients compatible without mixing their section
counts into the new map. Totals from before this change remain intact and have
no reconstructed location history.

The Worker uses trusted `request.cf.country`, `latitude`, and `longitude` from
Cloudflare. Coordinates are rounded to 5-degree grid cells before storage;
only counts per country/cell are retained, without linking cells to stored
visit IDs. No client-supplied coordinates or location headers are trusted.
Missing/invalid locations still count toward visits and are reported as
unlocated. VPN and network routing can affect IP-derived locations.

The same existing SQLite Durable Object gains two additive tables:
`map_totals` and `visitor_locations`. Never drop/reinitialize `totals` or `events`.
The map's start date initializes once and survives redeploys.

`assets/maps/world.svg` is a local equirectangular outline generated from
[Natural Earth 1:110m country boundaries](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson)
on September 26, 2026; Natural Earth data is public domain. Coordinates are
projected as `x = 2 * (longitude + 180)`, `y = 2 * (90 - latitude)` and rounded
to one decimal place. The map loads no external scripts or map tiles. Hover or
focus a dot for its country and count; the disclosure lists country totals.

## Test and prepare

```sh
npm ci
npm test
npx wrangler deploy --dry-run
```

The tests run the actual Cloudflare runtime locally, including SQLite persistence,
concurrent events, duplicate retries, validation, CORS, coarse geolocation,
legacy-client compatibility, and restarts. They never
contact or change the public counter.

## Maintain and deploy

Wrangler uses its own local OAuth credentials, never repository secrets. If
authorization expires, sign in using the minimal scopes needed here:

```sh
npx wrangler login --scopes account:read user:read workers_scripts:write
npx wrangler deploy --config wrangler.staging.toml
# Verify staging before deploying production:
npm run deploy
```

Staging permits writes from `http://127.0.0.1:4333` and has separate storage.
Use it for increment and browser compatibility checks. Production permits
writes only from `https://chikuang.github.io`; local site previews only read.
`GET /views` returns the total without increasing it and can safely verify
production. Staging was tested in Firefox, Safari and Chromium, including a
duplicate event that correctly left the total unchanged.

Production was seeded with the verified legacy total of 42. `INITIAL_TOTAL`
only initializes an empty database; redeployment never resets the count.
Existing unrecorded historical traffic cannot be reconstructed. The service
was deployed without enabling a paid subscription.

After changing frontend files, build Hugo and verify the local preview before
publishing the two GitHub repositories. Backend deployment alone does not
publish the website.

Never rename the Durable Object class, Worker or `COUNTER_NAME`, delete its
storage, or deploy tests to production: these could split or erase the history.
The two repositories remain on GitHub Pages; only counting runs on Cloudflare.

This is a lightweight public page-view counter, not fraud-proof analytics.
Origin checks prevent other websites from recording through ordinary browser
requests; they do not authenticate a caller with a custom HTTP client.
An explicitly blocked endpoint, disabled JavaScript, exhausted service quota,
or network outage still prevents live counting. Browser protections are not
changed or bypassed.

Sources: [Cloudflare setup](https://developers.cloudflare.com/durable-objects/get-started/),
[SQLite storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/),
[Free-plan limits](https://developers.cloudflare.com/durable-objects/platform/pricing/).
