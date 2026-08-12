# ME Tutors Live Dashboard

Next.js App Router dashboard that pulls live issue metrics from Jira Cloud and shows them on `/dashboard`.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Jira Cloud REST API v3 (server-side only)
- Recharts for pie charts

## How it works

```text
Browser (dashboard UI)
   │
   │  fetch /api/jira/dashboard?people=&module=&refresh=
   ▼
Next.js Route Handler  (app/api/jira/*)
   │
   │  Basic Auth with JIRA_EMAIL + JIRA_API_TOKEN
   ▼
Jira Cloud REST API v3
   │
   │  search issues → normalize → calculate metrics
   ▼
JSON response → KPI cards, status cards, charts, tables
```

Important: the browser never talks to Jira directly. Credentials stay on the server.

### 1. Connection

`GET /api/jira/test` calls Jira `GET /rest/api/3/myself` to verify the email + API token.

### 2. Loading issues

`GET /api/jira/dashboard` builds a JQL query and fetches every matching issue (paginated).

Default JQL:

```sql
project = MTMVPII
  AND (sprint in openSprints() OR sprint in futureSprints())
ORDER BY updated DESC
```

- `project = JIRA_PROJECT_KEY` limits results to this project.
- **Sprint-only (default on):** counts only tickets in the active/future sprint (e.g. Week 28 = 203). Board Backlog and resolved tickets outside that sprint are excluded. Controlled in `lib/jira/constants.ts` → `PROJECT_DEFAULTS.excludeBacklog`.

Only the fields needed for the dashboard are requested.

### 3. Caching

Fetched issues are cached in memory for `PROJECT_DEFAULTS.cacheMinutes` (5 minutes).

- Normal loads reuse the cache.
- **Pull Live** sends `refresh=1`, which bypasses the cache and re-fetches from Jira.

### 4. Filters

UI filters are applied **after** issues are loaded (no page reload):

| Filter | Meaning |
| --- | --- |
| People / Ticket Source | Custom field `JIRA_TICKET_SOURCE_FIELD` if set; otherwise assignee |
| System Area / Module | Custom field `JIRA_MODULE_FIELD` if set; otherwise labels from `MODULE_LABELS` |

### 5. Metrics

Calculated from the filtered issue list. Mappings live in `lib/jira/constants.ts`:

| Metric | Source |
| --- | --- |
| Bugs / Tasks | `ISSUE_TYPES` |
| Status buckets | `STATUS_MAPPING` |
| Team split | `TEAMS` |
| Avg time to close | `resolutiondate − created` for resolved issues |
| Issue links | `JIRA_URL/browse/{key}` |

### 6. AWS Amplify

Amplify injects console env vars into the **build** container only. `amplify.yml` writes every `JIRA_*` value into `.env.production` during build so route handlers can read them at runtime.

## Setup

1. Copy env file:

```bash
cp .env.example .env.local
```

2. Fill in **required** values only:

```env
JIRA_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=MTMVPII
```

Optional: `JIRA_PROJECT_NAME`, `JIRA_MODULE_FIELD`, `JIRA_TICKET_SOURCE_FIELD`.

Everything else (statuses, teams, module labels, bug/task types, backlog exclusion, cache TTL) is in:

```text
lib/jira/constants.ts
```

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## API Routes

| Route | Description |
| --- | --- |
| `GET /api/jira/test` | Verifies Jira authentication |
| `GET /api/jira/dashboard` | Returns dashboard metrics |

### Dashboard query params

- `people` — People / Ticket Source filter
- `module` — System Area / Module filter
- `refresh=1` — Bypass server cache (**Pull Live**)

## Project layout

```text
app/
  api/jira/test|dashboard|export/route.ts
  dashboard/page.tsx
components/dashboard/
lib/jira/
  constants.ts   # statuses, teams, types, module labels (edit here)
  config.ts      # reads env + merges constants
  client.ts | issues.ts | dashboard.ts | cache.ts
types/jira.ts
amplify.yml
```

## Security

`JIRA_EMAIL` and `JIRA_API_TOKEN` are server-only. Never use `NEXT_PUBLIC_*` for them.

Client → Next.js route handlers → Jira. Never client → Jira.
