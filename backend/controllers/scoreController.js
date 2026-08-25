const Company = require("../models/Company");
const FinancialData = require("../models/FinancialData");
const ScoreRun = require("../models/ScoreRun");
const pack = require("../data/suzlon");
const { mongoReady } = require("../config/database");
const memory = require("../config/memoryStore");
const { SIGNAL_WEIGHTS } = require("../config/constants");
const { seedMemory } = require("./companyController");

function clamp(n, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

function ratio(num, den) {
  if (!den) return num === 0 ? 0 : Infinity;
  return num / den;
}

function stdev(xs) {
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length);
}

function directionFromScore(score) {
  if (score >= 72) return "positive";
  if (score >= 52) return "watch";
  return "risk";
}

function scoreDebtToEbitda(x) {
  if (!isFinite(x) || x < 0) return 40;
  if (x <= 0.5) return 92;
  if (x <= 1) return 84;
  if (x <= 2) return 72;
  if (x <= 3) return 58;
  if (x <= 4.5) return 42;
  return 22;
}

function scoreCoverage(x) {
  if (!isFinite(x) || x <= 0) return 15;
  if (x >= 8) return 90;
  if (x >= 6) return 82;
  if (x >= 4) return 70;
  if (x >= 2.5) return 55;
  if (x >= 1.5) return 38;
  return 18;
}

function scoreReceivableGrowth(from, to) {
  const growth = (to - from) / from;
  if (growth <= 0) return 86;
  if (growth <= 0.15) return 74;
  if (growth <= 0.35) return 62;
  if (growth <= 0.6) return 50;
  if (growth <= 0.9) return 40;
  return 28;
}

function scoreCashConversion(latest, volatility) {
  let s = 50;
  if (latest >= 0.7) s = 82;
  else if (latest >= 0.5) s = 70;
  else if (latest >= 0.35) s = 58;
  else if (latest >= 0.15) s = 42;
  else s = 28;
  if (volatility > 0.2) s -= 10;
  return clamp(s);
}

function scoreWcTrend(days) {
  const last = days[days.length - 1];
  const prev = days[days.length - 2];
  let s = 70;
  if (last > 90) s = 48;
  else if (last > 70) s = 58;
  else if (last > 45) s = 68;
  else s = 80;
  if (last > prev + 8) s -= 8;
  if (last < prev - 8) s += 6;
  return clamp(s);
}

function rowsForScore(dbRows) {
  if (dbRows && dbRows.length) {
    return [...dbRows].sort((a, b) => a.year - b.year);
  }
  return pack.annuals;
}

/** Deterministic scoring — all decision logic lives here, not in a service. */
function buildScoreCard(annuals) {
  const fy = annuals.slice(-4);
  const last = fy[fy.length - 1];
  const fy23 = annuals.find((r) => r.fy === "FY23") || fy[0];

  const debtEbitdaTrend = fy.map((r) => ({
    period: r.fy,
    value: Number(ratio(r.borrowings, r.ebitda).toFixed(2)),
  }));
  const lastDE = debtEbitdaTrend[debtEbitdaTrend.length - 1].value;
  const deScore = clamp(
    lastDE > debtEbitdaTrend[0].value + 0.03
      ? scoreDebtToEbitda(lastDE) - 4
      : scoreDebtToEbitda(lastDE)
  );

  const coverageTrend = fy.map((r) => ({
    period: r.fy,
    value: Number(ratio(r.ebitda, r.interest).toFixed(2)),
  }));
  const lastCov = coverageTrend[coverageTrend.length - 1].value;
  const interestRisingFast = last.interest / fy[0].interest > 2;
  const covScore = clamp(scoreCoverage(lastCov) - (interestRisingFast ? 8 : 0));

  const recvTrend = fy.map((r) => ({ period: r.fy, value: r.debtorDays }));
  const recvScore = scoreReceivableGrowth(fy23.debtorDays, last.debtorDays);

  const convTrend = fy.map((r) => ({
    period: r.fy,
    value: Number(ratio(r.cfo, r.ebitda).toFixed(2)),
  }));
  const convVals = convTrend.map((p) => p.value);
  const convScore = scoreCashConversion(convVals[convVals.length - 1], stdev(convVals));

  const wcTrend = fy.map((r) => ({ period: r.fy, value: r.wcDays }));
  const wcScore = scoreWcTrend(fy.map((r) => r.wcDays));

  const w = SIGNAL_WEIGHTS;
  const signals = [
    {
      id: "debt-ebitda",
      name: "Debt / EBITDA trend",
      weight: w.debtEbitda,
      score: deScore,
      direction: directionFromScore(deScore),
      confidence: 82,
      displayValue: `${lastDE.toFixed(2)}x · FY26 gross debt ₹${last.borrowings} Cr`,
      trend: debtEbitdaTrend,
      whyItMatters:
        "Leverage shows how many years of operating earnings it would take to repay gross debt. A rising trend can mean growth is funded with borrowings rather than cash.",
      explanation: `Gross borrowings / EBITDA is ${lastDE.toFixed(2)}x in ${last.fy} versus ${debtEbitdaTrend[0].value.toFixed(2)}x in ${fy[0].fy}. Absolute leverage is still well below a 3x lender band after the FY23–24 deleveraging. We use Screener gross borrowings, not Tijori net cash, so the ratio stays conservative if cash is encumbered.`,
      reliedOn: {
        sourceId: "screener",
        sourceName: "Screener.in",
        reason:
          "Filing-derived gross borrowings are definitionally consistent. Tijori net cash is shown in provenance but is not the denominator.",
      },
    },
    {
      id: "interest-coverage",
      name: "Interest coverage",
      weight: w.interestCoverage,
      score: covScore,
      direction: directionFromScore(covScore),
      confidence: 74,
      displayValue: `${lastCov.toFixed(2)}x · interest ₹${last.interest} Cr`,
      trend: coverageTrend,
      whyItMatters:
        "Coverage is the first defence against a rate or volume shock. A low-debt company can still be fragile if finance costs rise faster than EBITDA.",
      explanation: `EBITDA / interest is ${lastCov.toFixed(2)}x in ${last.fy} (above a 3x floor). Interest still rose from ₹${fy[0].interest} Cr to ₹${last.interest} Cr while gross debt stayed in the hundreds of crores. Confidence is marked down until a finance-cost breakup exists.`,
      reliedOn: {
        sourceId: "screener",
        sourceName: "Screener.in",
        reason: "Same annual P&L series for EBITDA and interest — no mixed-source ratios.",
      },
    },
    {
      id: "receivable-days",
      name: "Receivable days growth",
      weight: w.receivableDays,
      score: recvScore,
      direction: directionFromScore(recvScore),
      confidence: 88,
      displayValue: `${last.debtorDays} days · ${fy23.debtorDays} in FY23`,
      trend: recvTrend,
      whyItMatters:
        "Stretching debtor days is a leading liquidity signal: profit can look healthy while cash is trapped in PSU / C&I receivables and unbilled revenue.",
      explanation: `Debtor days nearly doubled from ${fy23.debtorDays} (FY23) to ${last.debtorDays} (${last.fy}) while sales grew from ₹${fy23.sales} Cr to ₹${last.sales} Cr. ICRA attributes the stretch to PSU and large C&I milestone billing. This is the primary working-capital condition on a ₹1 Cr facility.`,
      reliedOn: {
        sourceId: "screener",
        sourceName: "Screener.in",
        reason: "10-year debtor-days series; ICRA used only as qualitative corroboration.",
      },
    },
    {
      id: "cfo-vs-profit",
      name: "Operating cash flow vs profit",
      weight: w.cfoVsProfit,
      score: convScore,
      direction: directionFromScore(convScore),
      confidence: 80,
      displayValue: `${(convVals[convVals.length - 1] * 100).toFixed(0)}% CFO / EBITDA`,
      trend: convTrend,
      whyItMatters:
        "Accrual profit can be boosted by deferred tax, unbilled revenue, or working-capital build. Cash conversion tells you whether earnings are bankable.",
      explanation: `CFO / operating profit swung ${fy
        .map((r) => `${r.fy} ${(ratio(r.cfo, r.ebitda) * 100).toFixed(0)}%`)
        .join(" → ")}. Mar 2025 and Sep 2025 net profit exceeded PBT because of deferred-tax-asset recognition (non-cash). We underwrite on PBT and CFO, not PAT.`,
      reliedOn: {
        sourceId: "screener",
        sourceName: "Screener.in",
        reason: "Cash-flow statement and P&L from the same filing rebuild.",
      },
    },
    {
      id: "working-capital",
      name: "Working capital trend",
      weight: w.workingCapital,
      score: wcScore,
      direction: directionFromScore(wcScore),
      confidence: 78,
      displayValue: `${last.wcDays} WC days · CCC ${last.cashConvCycle} days`,
      trend: wcTrend,
      whyItMatters:
        "Working-capital days size the revolver the borrower actually needs. A structural rise means growth consumes cash even if EBITDA margin expands.",
      explanation: `Working-capital days are ${last.wcDays} in ${last.fy} versus ${fy23.wcDays} in FY23. Cash conversion cycle improved from ${fy[0].cashConvCycle} to ${last.cashConvCycle} days on payables/inventory, but receivable stretch offsets that. Growth is WC-intensive.`,
      reliedOn: {
        sourceId: "screener",
        sourceName: "Screener.in",
        reason: "Screener WC-days and CCC series; no conflicting primary source on this metric.",
      },
    },
  ];

  const headlineScore = Math.round(
    signals.reduce((acc, s) => acc + s.score * s.weight, 0)
  );
  const baseConf = signals.reduce((acc, s) => acc + s.confidence * s.weight, 0);
  const confidence = Math.round(clamp(baseConf - 6));

  let verdict = "DECLINE";
  if (headlineScore >= 75) verdict = "APPROVE";
  else if (headlineScore >= 55) verdict = "APPROVE_WITH_CONDITIONS";

  const conditions = [
    "Cap incremental working-capital limits until debtor days reverse toward ~100 or collections evidence is provided for PSU / C&I milestones.",
    "Require a finance-cost breakup next quarter: interest on borrowings vs LC/BG commissions vs other charges.",
    "Underwrite on PBT and CFO, not PAT: deferred-tax-asset credits inflated Mar-25 and Sep-25 net profit.",
    "Treat Tijori’s shrinking net-cash cushion (Mar-25 −₹1,942 Cr → Sep-25 −₹381 Cr) as a liquidity watch, not as a substitute leverage ratio.",
  ];

  const assumptions = [
    "Loan asked: ₹1 crore working-capital facility — small versus FY26 sales of ₹16,732 Cr, so solvency is not the constraint; collections and cash conversion are.",
    "Debt/EBITDA uses gross borrowings from Screener, not net cash from Tijori.",
    "Jun 2025 quarterly P&L follows Screener where BlinkX disagrees.",
    "PAT is ignored as an earnings base in quarters with negative effective tax (DTA).",
    "Rating upgrades are qualitative context, not a weighted input.",
  ];

  return {
    asOf: last.fy,
    verdict,
    headlineScore,
    confidence,
    summary:
      verdict === "APPROVE_WITH_CONDITIONS"
        ? `Lend ₹1 crore with conditions. Leverage (${lastDE.toFixed(2)}x) and coverage (${lastCov.toFixed(2)}x) support a small working-capital line, and CRISIL/ICRA A+/Stable corroborates the turnaround. The hold-back is cash: debtor days nearly doubled since FY23 and CFO/EBITDA is volatile. The facility should be tightly monitored on collections, not sized as if earnings quality were clean.`
        : `Headline score ${headlineScore}.`,
    conditions,
    assumptions,
    signals,
    strengths: [
      "Gross leverage well below 1x after FY23–24 deleveraging",
      "Interest coverage still above 6x",
      "Independent A+/Stable ratings from CRISIL and ICRA",
    ],
    qualitative: [
      {
        id: "ratings",
        title: "Five rating upgrades in under two years",
        severity: "opportunity",
        body: "CRISIL moved Suzlon from BBB- (2022) to A+/Stable (Jul 2025); ICRA independently assigned A+/Stable. Kept outside the weighted score so the engine stays statement-driven.",
      },
      {
        id: "restructuring",
        title: "Two prior debt restructurings (2013, 2020–21)",
        severity: "watch",
        body: "ICRA records a 2013 CDR and a 2020–21 16-lender resolution. Already in the A+ rating; relevant as pattern risk if WC stretch is funded with short-term debt again.",
      },
      {
        id: "dta",
        title: "Deferred-tax profit distortion",
        severity: "risk",
        body: "Mar 2025 and Sep 2025 net profit >> PBT (effective tax rates around −114% and −127%). Non-cash DTA. Scoring uses PBT and CFO.",
      },
    ],
  };
}

async function loadAnnuals(slug) {
  if (!mongoReady()) {
    if (!memory.companies.size) seedMemory();
    return { company: memory.companies.get(slug) || null, annuals: memory.financials.get(slug) || pack.annuals };
  }
  const company = await Company.findOne({ slug });
  if (!company) return { company: null, annuals: [] };
  const rows = await FinancialData.find({ companyId: company._id }).sort({ year: 1 });
  return { company, annuals: rowsForScore(rows) };
}

exports.getCompanyScore = async (req, res) => {
  try {
    const { slug } = req.params;
    const { company, annuals } = await loadAnnuals(slug);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const card = buildScoreCard(annuals);
    const payload = { companySlug: slug, loanAmountCr: 1, ...card };

    if (mongoReady() && company._id && company._id !== "mem-suzlon") {
      await ScoreRun.create({
        companyId: company._id,
        companySlug: slug,
        asOf: card.asOf,
        verdict: card.verdict,
        headlineScore: card.headlineScore,
        confidence: card.confidence,
        summary: card.summary,
        conditions: card.conditions,
        assumptions: card.assumptions,
        signals: card.signals,
        qualitative: card.qualitative,
        strengths: card.strengths,
      });
    } else {
      memory.scores.unshift(payload);
    }

    res.json(payload);
  } catch (error) {
    console.error("Score calculation error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getScoreHistory = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!mongoReady()) {
      return res.json(memory.scores.filter((s) => s.companySlug === slug).slice(0, 10));
    }
    const company = await Company.findOne({ slug });
    if (!company) return res.status(404).json({ error: "Company not found" });
    const scores = await ScoreRun.find({ companyId: company._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.buildScoreCard = buildScoreCard;
