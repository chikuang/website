# Persistent live view counter

Deployed in the site owner's Cloudflare account on September 19, 2026:

- Production: https://chikuang-site-views.chikuang-site-views.workers.dev/views
- Staging: https://chikuang-site-views-staging.chikuang-site-views.workers.dev/views

The production endpoint is configured in `../../data/view_count.json`.
Publishing the rebuilt GitHub Pages output activates it on the public website.

The Worker stores one all-time total in a SQLite Durable Object. `GET /views`
reads the total; `POST /views` records one UUID-identified view. Repeating a POST
with the same event ID is safe, including after a restart. Only the total and
random per-event IDs are stored by the application: no cookies, visitor IDs,
IP addresses, or browsing history. Cloudflare still handles network requests.

The frontend reads the total every 30 seconds while visible. Page loads,
embedded-section changes and back/forward cache restorations record views.
Selecting the current section or refreshing the displayed count does not.
Local previews only read the total. Failed requests are marked unavailable or
offline; the frontend never substitutes a fixed snapshot or invented increment.

## Test and prepare

```sh
npm ci
npm test
npx wrangler deploy --dry-run
```

The tests run the actual Cloudflare runtime locally, including SQLite persistence,
concurrent events, duplicate retries, validation, CORS and restarts. They never
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
