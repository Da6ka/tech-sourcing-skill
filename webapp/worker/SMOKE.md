# Smoke test — post-deploy

Quick check that the deployed Worker (and the `fetch_profile` → Apollo path) is live.
The only public endpoint is `POST /api/source`, which runs the full agent loop, so this
exercises search + enrichment end to end.

## 1. Find the Worker URL

Printed at the end of `wrangler deploy`, or:

```
npx wrangler deployments list | head
```

Save it (format: `https://tech-sourcing-webapp.<subdomain>.workers.dev`):

```
export WORKER_URL="https://tech-sourcing-webapp.<subdomain>.workers.dev"
```

## 2. (Optional) Stream logs in a second terminal

An Apollo auth failure surfaces here as `Apollo match failed with status 401`:

```
npx wrangler tail --format pretty
```

> Caveat: `wrangler tail` only streams reliably in a real interactive terminal (TTY).
> Piped to a file or run from a background/non-interactive shell it connects but may
> capture no invocations — don't rely on it as the primary check. The response-body
> check in "Pass criteria" below is the reliable signal.

## 3. Endpoint is alive (empty body → 400, not 500)

```
curl -sS -X POST "$WORKER_URL/api/source" -H 'content-type: application/json' \
  -d '{}' -w '\nHTTP %{http_code}\n'
```

Expect `{"error":"jobDescription is required"}` and `HTTP 400`.

## 4. Full run (short JD that triggers a LinkedIn search + enrichment)

The Opus loop takes a while, so use a large timeout:

```
curl -sS --max-time 180 -X POST "$WORKER_URL/api/source" \
  -H 'content-type: application/json' \
  -d '{"jobDescription":"Lead Data Engineer, remote. 5+ years, lead experience, SQL+Python, Google BigQuery, Apache Airflow, ClickHouse, dbt, Kafka. Find candidates on LinkedIn."}' \
  | python3 -m json.tool | head -60
```

## Pass criteria

- HTTP 200; response has a `result` field with a Markdown sourcing write-up (persona / profile table).
- **The Apollo path ran (reliable check):** the `result` contains data that only Apollo
  returns, not LinkedIn search snippets — e.g. a candidate's current employer that the
  snippet doesn't show, or Apollo's `(NDA)` placeholder for a hidden current company. If a
  LinkedIn candidate's dated employment history / current employer shows up, enrichment
  worked and there was no 401.
- If profiles come back with only snippet-level detail (no employer history) the enrichment
  fell back — check `npx wrangler secret list` for `APOLLO_API_KEY`, and if the secret is
  present, a 401 means the auth header is wrong: switch `X-Api-Key` to an `api_key` body
  field in `src/enrich.ts`.

Quick response-body check (Python):

```
python3 -c "import json,sys; r=json.load(open('smoke.json'))['result']; print('HTTP ok, len', len(r)); print('enriched:', any(k in r for k in ['(NDA)','Semrush','employment']))"
```

(Save the curl output with `-o smoke.json` first.)

## Notes

- Rate limit: ~3–5 runs from one IP hit a 429 (`RateLimiterDO`). One or two runs is enough
  for a smoke; wait out the window or switch networks if you hit it.
- Requires the `APOLLO_API_KEY` secret to be set (`npx wrangler secret put APOLLO_API_KEY`)
  alongside `ANTHROPIC_API_KEY` and `FIRECRAWL_API_KEY`.
