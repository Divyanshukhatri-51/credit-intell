# Verity — Credit intelligence (Suzlon Energy)

Would you lend **Suzlon Energy Ltd ₹1 crore** of working capital? This app turns public filings and rating rationals into a defensible **Approve / Approve with conditions / Decline** memo.

## Architecture (monolith)

```
backend/
  server.js                 Express entry
  models/                   Company, FinancialData, ScoreRun, Source
  controllers/              All business logic (no services layer)
    companyController.js    Fetch + seed
    scoreController.js      Scoring, verdict, confidence, assumptions
    dataController.js       Period CRUD
  routes/                   Thin HTTP mapping
  data/suzlon.js            Seed pack (₹ Cr, sourced)
frontend/                   Next.js analyst workflow
```

MongoDB persists companies, annuals, and score runs. If Mongo is down, the API still boots with an in-memory copy of Suzlon so the memo can be demoed.

## Data sources

| Source | Trust | Role |
|---|---|---|
| Screener.in (BSE/NSE filings) | 85 | Primary P&L, BS, CF, debtor/WC days |
| CRISIL | 98 | Rating path |
| ICRA | 98 | Rating + restructuring history |
| Tijori Finance | 70 | Net-cash overlay (method unpublished) |
| BlinkX | 65 | Jun-2025 recomputation (discrepancy) |
| Company IR | 75 | Primary but promotional |

## Decision methodology

See [DECISION.md](./DECISION.md). Short version:

- Five weighted signals: Debt/EBITDA, interest coverage, receivable-days growth, CFO vs profit, working-capital days.
- Thresholds: score ≥75 Approve · ≥55 Approve with conditions · else Decline.
- Conflicting numbers are shown; the engine states which figure it used and why.
- Calculations are deterministic (no random). PAT is not the earnings base when it exceeds PBT (DTA).

## How to run

Node 20+. Mongo optional.

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000  
API: http://localhost:3001 (`GET /api/companies/suzlon`, `GET /api/scores/suzlon`)

With Mongo:

```bash
docker compose up -d
cd backend
npm run seed
```

## Deploy

- Frontend: Vercel — `NEXT_PUBLIC_API_URL` = API origin  
- API: Render/Railway — `npm start`, env `PORT`, `MONGODB_URI`, `FRONTEND_ORIGIN`  
- DB: MongoDB Atlas  

## Assumptions and limitations

- Suzlon is the only seeded borrower (assignment: pick one listed Indian company).
- ₹1 crore is small versus FY26 sales (~₹16,732 Cr); the credit question is collections quality, not solvency.
- No live scrape: figures are frozen from the 22 Aug 2026 pack. Re-seed after updating `backend/data/suzlon.js`.
- In-memory mode does not survive process restart.
