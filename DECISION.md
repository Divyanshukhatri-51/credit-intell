# Decision Methodology

**Question:** Should we lend Suzlon Energy Ltd **₹1 crore** of working capital?

This document explains how Verity turns public financial data into a lending recommendation. All calculations live in `backend/controllers/scoreController.js` and are **deterministic** — the same inputs always produce the same score and verdict.

---

## Overview

The engine does not display raw API numbers. It derives five credit signals from consolidated annual filings (Screener.in, rebuilt from BSE/NSE), maps each to a 0–100 score, combines them with fixed weights, and outputs:

- **Verdict:** `APPROVE` · `APPROVE_WITH_CONDITIONS` · `DECLINE`
- **Headline score:** 0–100 weighted composite
- **Confidence:** 0–100%, reduced when sources disagree
- **Conditions and assumptions** when uncertainty or weak signals remain

The UI traces every recommendation back to: **Recommendation → Insight → Calculation → Source**.

---

## Signals and metrics chosen

We chose signals that answer whether a **small working-capital line** is safe for Suzlon after its FY23–24 turnaround — not whether the company is solvent (₹1 Cr is tiny vs FY26 sales of ~₹16,732 Cr).

| # | Signal | Weight | What it measures |
|---|---|---|---|
| 1 | **Debt / EBITDA trend** | 25% | Gross leverage and whether it is rising off a low base |
| 2 | **Interest coverage** | 20% | EBITDA cushion against finance costs |
| 3 | **Receivable days growth** | 20% | Cash trapped in receivables vs revenue growth |
| 4 | **Operating cash flow vs profit** | 20% | Whether reported earnings convert to cash |
| 5 | **Working capital trend** | 15% | How much growth consumes cash in the WC cycle |

**Not in the weighted score (qualitative context only):**

- CRISIL / ICRA rating upgrades (A+/Stable) — independent corroboration, kept out so the model stays filing-driven
- Two prior debt restructurings (2013, 2020–21) — pattern risk, already reflected in ratings
- Deferred-tax profit distortion — handled by using PBT/CFO instead of PAT

---

## How each signal is calculated

All ratios use the **last four fiscal years** (FY23–FY26 unless fewer rows exist). Primary inputs: gross borrowings, EBITDA, interest, CFO, debtor days, WC days, cash conversion cycle — all from Screener consolidated annuals (₹ Crore).

### 1. Debt / EBITDA trend

```
Debt/EBITDA (per year) = Gross borrowings ÷ EBITDA
Latest ratio = value for most recent FY
```

**Score mapping (higher = better):**

| Ratio | Score |
|---|---|
| ≤ 0.5x | 92 |
| ≤ 1.0x | 84 |
| ≤ 2.0x | 72 |
| ≤ 3.0x | 58 |
| ≤ 4.5x | 42 |
| > 4.5x | 22 |

**Adjustments:** −4 if latest ratio is more than 0.03x above the start of the 4-year window (rising leverage off a trough).

**Why chosen:** After two restructurings, absolute leverage matters more than a single-year snapshot. A rising trend warns that growth may be re-leveraging the balance sheet.

---

### 2. Interest coverage

```
Interest coverage (per year) = EBITDA ÷ Interest expense
Latest coverage = value for most recent FY
```

**Score mapping:**

| Coverage | Score |
|---|---|
| ≥ 8x | 90 |
| ≥ 6x | 82 |
| ≥ 4x | 70 |
| ≥ 2.5x | 55 |
| ≥ 1.5x | 38 |
| < 1.5x | 18 |

**Adjustments:** −8 if interest in the latest year is more than **2×** interest at the start of the 4-year window (finance cost rising faster than debt alone would explain).

**Why chosen:** Even low-debt borrowers fail if finance costs outrun EBITDA. Suzlon shows rising interest with modest gross debt — coverage is watched, not taken at face value.

---

### 3. Receivable days growth

```
Growth = (Debtor days latest − Debtor days FY23) ÷ Debtor days FY23
```

**Score mapping (lower growth = better):**

| Growth vs FY23 | Score |
|---|---|
| ≤ 0% | 86 |
| ≤ 15% | 74 |
| ≤ 35% | 62 |
| ≤ 60% | 50 |
| ≤ 90% | 40 |
| > 90% | 28 |

**Why chosen:** Debtor days nearly doubled (72 → 137) while revenue grew ~2.8× — a classic “profit up, cash stuck” signal for PSU/C&I milestone billing (corroborated by ICRA narrative, not used as a numeric input).

---

### 4. Operating cash flow vs profit

```
Cash conversion (per year) = CFO ÷ EBITDA
Volatility = standard deviation of the 4 annual conversion ratios
```

**Score from latest conversion:**

| CFO / EBITDA | Base score |
|---|---|
| ≥ 70% | 82 |
| ≥ 50% | 70 |
| ≥ 35% | 58 |
| ≥ 15% | 42 |
| < 15% | 28 |

**Adjustments:** −10 if volatility (stdev) > 0.20 (swings like 61% → 10% → 59% → 42%).

**Why chosen:** Mar-25 and Sep-25 PAT >> PBT due to deferred-tax-asset recognition (non-cash). Underwriting uses **PBT and CFO**, not PAT.

---

### 5. Working capital trend

Uses **WC days** for the last four years.

**Base score from latest WC days:**

| WC days | Score |
|---|---|
| ≤ 45 | 80 |
| ≤ 70 | 68 |
| ≤ 90 | 58 |
| > 90 | 48 |

**Adjustments:** −8 if latest WC days > previous year + 8; +6 if latest < previous year − 8.

**Why chosen:** Working-capital days size the revolver a growing WTG business actually needs. Receivable stretch can offset CCC improvements elsewhere.

---

## How signals influence the decision

### Step 1 — Weighted headline score

```
headlineScore = round( Σ signalScore × weight )

Weights:
  Debt/EBITDA      25%
  Interest coverage 20%
  Receivable days   20%
  CFO vs profit     20%
  Working capital   15%
```

Each signal also gets a **direction** label for the UI:

- Score ≥ 72 → `positive`
- Score ≥ 52 → `watch`
- Score < 52 → `risk`

### Step 2 — Verdict thresholds

| Headline score | Verdict |
|---|---|
| ≥ 75 | **APPROVE** |
| ≥ 55 | **APPROVE WITH CONDITIONS** |
| < 55 | **DECLINE** |

### Step 3 — Confidence

```
confidence = round( Σ (signalConfidence × weight) − 6 )
```

Per-signal confidence reflects data quality (e.g. 88 for debtor days with a long consistent series; 74 for coverage until finance-cost breakup is available). The **−6** haircut reflects live disagreements between sources (see below).

### Step 4 — Conditions (when verdict is not a clean approve)

If the verdict is **Approve with conditions** or **Decline**, the engine attaches facility conditions tied to the weak signals, for example:

- Cap WC limits until debtor days improve or collections evidence is provided
- Require finance-cost breakup (interest vs LC/BG vs other charges)
- Underwrite on PBT/CFO, not PAT
- Monitor Tijori net-cash shrinkage as a liquidity watch

### Suzlon outcome (current data)

With FY23–FY26 filings, the engine typically lands in the **low 60s** → **Approve with conditions**. Solvency and coverage support a small line; **collections quality and volatile cash conversion** are the hold-back — appropriate for a ₹1 Cr WC facility.

Implementation reference: `buildScoreCard()` in `backend/controllers/scoreController.js`.

---

## How we handle conflicting data

Financial sources do not always agree. The product **shows both values**, flags the spread, states **which figure the score used**, and **why** — it does not pick one silently.

### Principles

1. **Prefer filing-derived series** when one source rebuilds from BSE/NSE (Screener, trust 85) and another is a broker recomputation (BlinkX, trust 65).
2. **Prefer disclosed definitions** over unpublished aggregates (e.g. gross borrowings on Screener vs Tijori net debt with unknown methodology).
3. **Do not mix sources inside one ratio** — EBITDA and interest both come from the same annual P&L series.
4. **Surface definitional gaps** — when two numbers are not comparable (gross debt vs net cash), label the spread as “definitional”, not a percentage error.
5. **Reduce confidence, not hide disagreement** — known conflicts apply a −6 point confidence haircut.

### Documented discrepancies (Suzlon)

| Metric | Sources | Spread | Used for scoring | Rationale |
|---|---|---|---|---|
| **Jun 2025 revenue** | Screener ₹3,132 Cr vs BlinkX ₹3,165 Cr | 1.1% | **Screener** | Filing-derived; spread too small to move annual leverage/coverage |
| **Jun 2025 EBITDA** | Screener ₹599 Cr vs BlinkX ₹632.54 Cr | 5.6% | **Screener** | Same quarter would move margin, but **annual** Debt/EBITDA and coverage use FY figures only |
| **Net debt / net cash** | Screener gross borrowings ₹323 Cr (FY25); Tijori net cash −₹1,942 Cr (Mar-25) and −₹381 Cr (Sep-25) | Definitional | **Screener gross borrowings** for Debt/EBITDA | Gross debt definition is consistent FY21–FY26; Tijori shown as **liquidity watch**, not ratio denominator |

These rows appear in the UI **Provenance** table with trust scores, notes, and `reliedWhy` text matching the table above.

### Assumptions recorded in every score run

- Loan size: ₹1 crore WC — solvency is not the binding constraint; collections are.
- Debt/EBITDA denominator: Screener gross borrowings, not Tijori net cash.
- Quarterly P&L where BlinkX disagrees: follow Screener.
- PAT excluded as earnings base when distorted by DTA.
- Rating path is context only, not a weighted input.

---

## Traceability checklist

For reviewers and the live technical round:

| Question | Where to look |
|---|---|
| What is the verdict? | UI decision section · `GET /api/scores/suzlon` → `verdict` |
| Why? | `summary`, `signals[].explanation`, `conditions` |
| How was it calculated? | `signals[].displayValue`, `signals[].trend`, this document |
| What source was used? | `signals[].reliedOn`, Provenance table, `sources[]` |
| What if sources disagree? | `discrepancies[]`, `assumptions[]`, confidence haircut |
| Can I reproduce it? | Same annuals in `backend/data/suzlon.js` → same `headlineScore` |

---

## Known limitations

- Figures are **seeded from a fixed research pack** (22 Aug 2026), not live-scraped. Update `backend/data/suzlon.js` and re-seed after new filings.
- Only **Suzlon** is seeded — the assignment asks for one company, not a multi-borrower platform.
- Score runs are **recomputed on each** `GET /api/scores/:slug` (history is stored but not used as a cache).
- Qualitative items (ratings, restructurings, DTA) inform the memo but are intentionally **outside** the weighted formula to avoid double-counting agency opinion.
