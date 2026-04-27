# Meetup OAuth Setup

The event aggregator uses Meetup's GraphQL API via the OAuth2 JWT-bearer flow (signed RSA assertion → bearer token, no interactive login). One-time setup:

## 1. Register an OAuth consumer

Go to <https://www.meetup.com/api/oauth/list/> → **Create New Consumer**.

- **Consumer Name:** SLC Tech Pulse
- **Website / Redirect URI:** `https://slc-tech-pulse.web.app`
- **Description:** Public aggregator for Utah tech-scene meetups

After creation, save the **Consumer Key** (client_id). That's `MEETUP_CLIENT_KEY`.

## 2. Generate an RSA keypair and upload the public key

```bash
openssl genpkey -algorithm RSA -out meetup-private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -in meetup-private.pem -pubout -out meetup-public.pem
```

In the consumer detail page on Meetup, find **Signing Keys** → **Add Signing Key** → paste the contents of `meetup-public.pem`. Meetup returns a **Key ID** for the uploaded public key. That's `MEETUP_SIGNING_KEY_ID`.

The contents of `meetup-private.pem` (full PEM, including header/footer lines) become `MEETUP_PRIVATE_KEY`.

## 3. Get your Meetup member ID

Visit <https://www.meetup.com/api/general/#member> while logged in, or hit `https://api.meetup.com/members/self` in a browser. The numeric `id` is `MEETUP_MEMBER_ID`. (The JWT `sub` claim must be the member who authorized the consumer — i.e. you.)

## 4. Wire secrets

**Locally (for dry-run):** add to `.env.local` or export in your shell:

```bash
export MEETUP_CLIENT_KEY=...
export MEETUP_SIGNING_KEY_ID=...
export MEETUP_MEMBER_ID=...
export MEETUP_PRIVATE_KEY="$(cat meetup-private.pem)"

npm run aggregate:events -- --dry-run
```

**GitHub Actions:** add the same four as **Repository Secrets** (Settings → Secrets and variables → Actions). The daily cron picks them up automatically.

## 5. Verify

```bash
npm run aggregate:events -- --dry-run
```

Expected: token exchange logs success, then per-group event counts. If the script logs `MEETUP_* secrets not set — skipping aggregation`, double-check that all four env vars are set.

## Notes

- Access tokens expire in 1 hour; the script fetches a fresh one on every run, so no refresh logic is needed for the daily cron.
- If a group's `urlname` 404s, edit `scripts/event-sources.ts`. Meetup occasionally lets organizers rename groups, which silently breaks the slug.
- Meetup's GraphQL schema has shifted historically. If a query field rejects, the error surface in `scripts/meetup-fetch.ts` will name it — adjust the query string and field mapping in `gqlToICalEvent`.
