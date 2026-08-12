# ME Tutors Live Dashboard

Next.js App Router dashboard that pulls live issue metrics from Jira Cloud.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Jira Cloud REST API v3 (server-side only)
- Excel export via `exceljs`

## Setup

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Fill in `.env.local`:

```env
JIRA_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=MTMVP
```

Optional configuration (status mapping, team members, custom fields) is documented in `.env.example`.

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

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

## Security

`JIRA_EMAIL` and `JIRA_API_TOKEN` are server-only. They are never exposed as `NEXT_PUBLIC_*` variables or returned by API responses.

Client components call Next.js route handlers only. Route handlers call Jira.
