# ME Tutors Live Dashboard

Next.js App Router dashboard that pulls live issue metrics from Jira Cloud and shows them on `/dashboard`.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Jira Cloud REST API v3 (server-side only)
- Recharts for pie charts
- Excel export via `exceljs`

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
  AND (
    sprint in openSprints()
    OR sprint in futureSprints()
    OR resolution is not EMPTY
  )
ORDER BY updated DESC
```

- `project = JIRA_PROJECT_KEY` limits results to this project.
- **Backlog exclusion (default on):** the board “Backlog” section is unfinished work that is **not** in an active or future sprint. Those tickets often still have an old closed sprint attached, so a simple `sprint is not EMPTY` filter is not enough. The query keeps:
  - issues in **open** sprints (e.g. Week 28)
  - issues in **future** sprints
  - already **resolved** issues (so average time-to-close still works)
- Toggle with `JIRA_EXCLUDE_BACKLOG=true|false` (default `true`). Set `false` to count every project ticket again.

Only the fields needed for the dashboard are requested (summary, type, status, assignee, dates, labels, components, optional custom fields).

### 3. Caching

Fetched issues are cached in memory on the server for `JIRA_CACHE_MINUTES` (default 5).

- Normal loads reuse the cache.
- **Pull Live** sends `refresh=1`, which bypasses the cache and re-fetches from Jira.

### 4. Filters

UI filters are applied **after** issues are loaded (no page reload):

| Filter | Meaning |
| --- | --- |
| People / Ticket Source | Custom field `JIRA_TICKET_SOURCE_FIELD` if set; otherwise assignee display name |
| System Area / Module | Custom field `JIRA_MODULE_FIELD` if set; otherwise components/labels (optionally limited by `JIRA_MODULE_LABELS`) |

Both filters can be combined. Options are built from the loaded issue set.

### 5. Metrics

From the filtered issue list the server calculates:

| Metric | Rule |
| --- | --- |
| Total | Count of matching issues |
| Bugs / Tasks | Issue type names from `JIRA_BUG_TYPES` / `JIRA_TASK_TYPES` |
| Bug / Task status | Status names mapped via `JIRA_STATUS_*` env vars |
| Team split | Assignee matched against `JIRA_BACKEND_USERS` / `JIRA_FRONTEND_USERS`; everyone else → Other |
| Avg time to close | Average of `resolutiondate − created` for resolved bugs/tasks (days, 1 decimal) |
| Resolved lists | Resolved bugs/tasks sorted by time-to-close descending; issue keys link to `JIRA_URL/browse/{key}` |

### 6. Excel export

`GET /api/jira/export` uses the same filters, builds a workbook (Summary + Issues sheets) with `exceljs`, and returns an `.xlsx` download.

### 7. AWS Amplify

Amplify injects console env vars into the **build** container only. `amplify.yml` writes every `JIRA_*` value into `.env.production` during build so route handlers can read them at runtime:

```yaml
- env | grep -E '^JIRA_' | sed -E 's/^([^=]+)="(.*)"$/\1=\2/' | sed -E 's/^([^=]+)=(.*)$/\1="\2"/' > .env.production
```

## Setup

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Fill in `.env.local` (minimum):

```env
JIRA_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=MTMVPII
JIRA_EXCLUDE_BACKLOG=true
```

Optional settings (status mapping, team members, custom fields, module labels) are listed in `.env.example`.

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) (or the port you started with).

## API Routes

| Route | Description |
| --- | --- |
| `GET /api/jira/test` | Verifies Jira authentication via `/rest/api/3/myself` |
| `GET /api/jira/dashboard` | Returns normalized dashboard metrics |
| `GET /api/jira/export` | Downloads an Excel workbook for the current filters |

### Dashboard query params

- `people` — People / Ticket Source filter
- `module` — System Area / Module filter
- `refresh=1` — Bypass server cache (used by **Pull Live**)

## Project layout

```text
app/
  api/jira/test|dashboard|export/route.ts   # server-only Jira API
  dashboard/page.tsx
components/dashboard/                       # UI cards, charts, filters
lib/jira/                                   # client, search, metrics, cache, excel
types/jira.ts
amplify.yml                                 # Amplify build + env wiring
```

## Security

`JIRA_EMAIL` and `JIRA_API_TOKEN` are server-only. They are never exposed as `NEXT_PUBLIC_*` variables or returned by API responses.

Client components call Next.js route handlers only. Route handlers call Jira.
