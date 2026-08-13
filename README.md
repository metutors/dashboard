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
   │  fetch /api/jira/dashboard?people=&module=&submodule=&refresh=
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

Both filters are applied **after** issues are loaded, on the cached dataset. Changing a filter never triggers another Jira request and never reloads the page. Every KPI, status card, chart, team split, average close time, and ticket list is recalculated from the filtered set, so the dashboard behaves as if the filtered tickets were the whole project.

The dropdowns are fixed lists defined in `lib/jira/constants.ts`, and the API accepts only those ids (`^[a-z0-9-]+$`); anything else returns `400 Invalid filter value`.

#### Filter 1 — People / Ticket Source (`PEOPLE_FILTERS`)

Each option maps a display name to a Jira user, because the names used on the dashboard differ from Jira:

| Option | Mode | Jira user | Matches |
| --- | --- | --- | --- |
| Reported by Usman | reported | Mubashar Hussain | All tickets reported, any status |
| Reported by Fayez | reported | Fayez Kharbat | All tickets reported, any status |
| Reported by Farah | reported | Farah | All tickets reported, any status |
| Reported by Razan | reported | Razan | All tickets reported, any status |
| Usman Working | working | Mubashar Hussain | Assigned **and** In Progress |
| Viber Working | working | Ahmed Hassan | Assigned **and** In Progress |
| Ahtsham Working | working | Ahtsham ul Hassan | Assigned **and** In Progress |

- `reported` matches the Jira **reporter** and ignores status.
- `working` matches the Jira **assignee** and keeps only statuses listed in `STATUS_MAPPING.inProgress`.
- Names match on the full display name or on any single name token, so `Farah` also matches `Farah <lastname>`.
- Farah and Razan currently have no tickets in the sprint dataset, so those options show the empty state until such tickets exist.

#### Filter 2 — System Area / Module (`MODULE_TREE`)

Main and sub categories map to **exact Jira labels** defined in `lib/jira/constants.ts`:

| Selection | Match rule |
| --- | --- |
| Main category only | Ticket has the main label (e.g. `Communication`) |
| Main + sub category | Ticket has **both** labels (e.g. `Communication` **and** `Emails`) |

Examples that already exist in the current sprint:

| Dropdown | Jira label(s) |
| --- | --- |
| Public Pages | `Public-Pages` |
| Admin | `Admin` |
| Communication | `Communication` |
| Communication › Emails | `Communication` + `Emails` |
| Teachers › Teachers Profile & Inner Pages | `Teachers` + `Teachers-Profile-Inner-Pages` |
| 1:1 Personalized Learning — Students › Booking & Classes Management | `1-1-Personalized-Learning-Students` + `Booking-Classes-Management` |

Label matching is case-insensitive. If a sub-category label has not been applied yet, that sub filter returns 0 tickets until the label exists in Jira. Every KPI, chart, team split, and Matching Tickets list is recalculated from the label-filtered set.

#### Combining filters

| Selection | Result |
| --- | --- |
| Neither | Full project dataset (203 sprint tickets) |
| People only | Reporter match, or In Progress assignee match |
| Module only | Main module, or main + sub module |
| Both | AND — only tickets matching both |

The filter bar always shows the matching ticket count and the active filter description. When nothing matches, an empty state explains why and the dashboard structure stays in place.

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

Optional: `JIRA_PROJECT_NAME`.

Everything else (people filters, module hierarchy, statuses, teams, bug/task types, backlog exclusion, cache TTL) is in:

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

- `people` — People / Ticket Source id from `PEOPLE_FILTERS` (e.g. `reported-fayez`, `working-ahtsham`)
- `module` — Main module id from `MODULE_TREE` (e.g. `communication`)
- `submodule` — Sub module id, only valid together with `module` (e.g. `emails`)
- `refresh=1` — Bypass server cache (**Pull Live**)

## Project layout

```text
app/
  api/jira/test|dashboard|export/route.ts
  dashboard/page.tsx
components/dashboard/
lib/jira/
  constants.ts   # people filters, module tree, statuses, teams, types (edit here)
  filters.ts     # filter matching engine
  config.ts      # reads env + merges constants
  client.ts | issues.ts | dashboard.ts | cache.ts
types/jira.ts
amplify.yml
```

## Security

`JIRA_EMAIL` and `JIRA_API_TOKEN` are server-only. Never use `NEXT_PUBLIC_*` for them.

Client → Next.js route handlers → Jira. Never client → Jira.
