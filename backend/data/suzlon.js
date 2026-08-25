/**
 * Suzlon Energy Ltd — public figures compiled 22 Aug 2026.
 * Units: ₹ Crore unless noted. Not fabricated.
 */
module.exports = {
  profile: {
    slug: "suzlon",
    name: "Suzlon Energy Ltd",
    ticker: "SUZLON",
    exchange: "NSE / BSE 532667",
    sector: "Capital Goods — Wind Turbine Generators",
    website: "https://www.suzlon.com",
    description:
      "India's largest wind turbine generator manufacturer, vertically integrated across manufacturing, project execution, and O&M. Two debt restructurings (2013 CDR, 2020–21 16-lender plan) before a turnaround from FY23. Rated CRISIL A+/Stable and ICRA A+/Stable as of Jul 2025.",
  },

  sources: [
    {
      sourceId: "screener",
      name: "Screener.in",
      type: "FINANCIAL",
      url: "https://www.screener.in/company/SUZLON/consolidated/",
      trustScore: 85,
      why: "10-year consistent line-item history rebuilt from BSE/NSE filings, not self-reported.",
    },
    {
      sourceId: "crisil",
      name: "CRISIL Ratings",
      type: "RATING_AGENCY",
      url: "https://www.crisil.com/mnt/winshare/Ratings/RatingList/RatingDocs/SuzlonEnergyLimited_July%2029_%202025_RR_374635.html",
      trustScore: 98,
      why: "SEBI-registered agency with banker/management access.",
    },
    {
      sourceId: "icra",
      name: "ICRA",
      type: "RATING_AGENCY",
      url: "https://www.icra.in/Rating/ShowRationalReportFilePdf/136727",
      trustScore: 98,
      why: "Independent corroboration of CRISIL; source of restructuring history.",
    },
    {
      sourceId: "tijori",
      name: "Tijori Finance",
      type: "FINANCIAL",
      url: "https://www.tijorifinance.com/company/suzlon-energy-limited/financials/",
      trustScore: 70,
      why: "Independent cross-check; net-debt methodology is not disclosed.",
    },
    {
      sourceId: "blinkx",
      name: "BlinkX (Nuvama Wealth)",
      type: "OTHER",
      url: "https://blinkx.in/insights/results/suzlon-energy-ltd-quarterly-result",
      trustScore: 65,
      why: "Broker recomputation used to surface a genuine same-period discrepancy.",
    },
    {
      sourceId: "company-ir",
      name: "Suzlon Energy Ltd IR",
      type: "OTHER",
      url: "https://www.suzlon.com/press-release-detail/492/fy25-results-best-year-in-a-decade-suzlon-posts-10-year-high-profit-before-tax-pbt-at-rs-1447-crores",
      trustScore: 75,
      why: "Primary disclosure, but promotional framing.",
    },
  ],

  annuals: [
    { fy: "FY21", year: 2021, sales: 3346, expenses: 2809, ebitda: 537, otherIncome: 823, interest: 996, depreciation: 258, pbt: 105, netProfit: 104, equityCap: 1702, reserves: -5045, borrowings: 6925, otherLiab: 3019, totalLiab: 6601, cfo: 530, cfi: -24, cff: -327, fcf: 482, debtorDays: 130, inventoryDays: 503, daysPayable: 366, cashConvCycle: 266, wcDays: 84, roce: 10 },
    { fy: "FY22", year: 2022, sales: 6582, expenses: 5682, ebitda: 900, otherIncome: 95, interest: 735, depreciation: 260, pbt: 0, netProfit: -177, equityCap: 1843, reserves: -5369, borrowings: 6465, otherLiab: 3535, totalLiab: 6475, cfo: 1302, cfi: -19, cff: -1045, fcf: 1226, debtorDays: 76, inventoryDays: 186, daysPayable: 155, cashConvCycle: 107, wcDays: 16, roce: 21 },
    { fy: "FY23", year: 2023, sales: 5971, expenses: 5137, ebitda: 833, otherIncome: 2739, interest: 421, depreciation: 260, pbt: 2892, netProfit: 2887, equityCap: 2454, reserves: -1355, borrowings: 1938, otherLiab: 2486, totalLiab: 5523, cfo: 491, cfi: 85, cff: -709, fcf: 477, debtorDays: 72, inventoryDays: 176, daysPayable: 86, cashConvCycle: 162, wcDays: 66, roce: 20 },
    { fy: "FY24", year: 2024, sales: 6529, expenses: 5492, ebitda: 1037, otherIncome: -24, interest: 164, depreciation: 190, pbt: 659, netProfit: 660, equityCap: 2722, reserves: 1199, borrowings: 150, otherLiab: 3108, totalLiab: 7179, cfo: 80, cfi: -152, cff: 132, fcf: -147, debtorDays: 102, inventoryDays: 210, daysPayable: 165, cashConvCycle: 148, wcDays: 103, roce: 25 },
    { fy: "FY25", year: 2025, sales: 10890, expenses: 9026, ebitda: 1863, otherIncome: 97, interest: 255, depreciation: 259, pbt: 1447, netProfit: 2072, equityCap: 2732, reserves: 3374, borrowings: 323, otherLiab: 6531, totalLiab: 12960, cfo: 1092, cfi: -749, cff: 343, fcf: 724, debtorDays: 130, inventoryDays: 171, daysPayable: 156, cashConvCycle: 145, wcDays: 73, roce: 33 },
    { fy: "FY26", year: 2026, sales: 16732, expenses: 13707, ebitda: 3025, otherIncome: 178, interest: 462, depreciation: 318, pbt: 2422, netProfit: 3163, equityCap: 2745, reserves: 6719, borrowings: 556, otherLiab: 8850, totalLiab: 18869, cfo: 1202, cfi: -914, cff: -155, fcf: 626, debtorDays: 137, inventoryDays: 152, daysPayable: 172, cashConvCycle: 117, wcDays: 84, roce: 34 },
  ],

  quarters: [
    { quarter: "Jun 2023", sales: 1351, ebitda: 199, interest: 62, pbt: 101, netProfit: 101 },
    { quarter: "Sep 2023", sales: 1421, ebitda: 225, interest: 44, pbt: 102, netProfit: 102 },
    { quarter: "Dec 2023", sales: 1560, ebitda: 248, interest: 14, pbt: 203, netProfit: 203 },
    { quarter: "Mar 2024", sales: 2196, ebitda: 357, interest: 44, pbt: 253, netProfit: 254 },
    { quarter: "Jun 2024", sales: 2022, ebitda: 370, interest: 45, pbt: 302, netProfit: 302 },
    { quarter: "Sep 2024", sales: 2103, ebitda: 294, interest: 56, pbt: 202, netProfit: 201 },
    { quarter: "Dec 2024", sales: 2975, ebitda: 500, interest: 70, pbt: 391, netProfit: 388 },
    { quarter: "Mar 2025", sales: 3790, ebitda: 693, interest: 85, pbt: 551, netProfit: 1181 },
    { quarter: "Jun 2025", sales: 3132, ebitda: 599, interest: 103, pbt: 459, netProfit: 324 },
    { quarter: "Sep 2025", sales: 3871, ebitda: 721, interest: 110, pbt: 562, netProfit: 1279 },
    { quarter: "Dec 2025", sales: 4236, ebitda: 738, interest: 114, pbt: 567, netProfit: 445 },
    { quarter: "Mar 2026", sales: 5493, ebitda: 964, interest: 135, pbt: 833, netProfit: 1114 },
    { quarter: "Jun 2026", sales: 3829, ebitda: 595, interest: 134, pbt: 389, netProfit: 305 },
  ],

  ratings: [
    { date: "2022-06-01", agency: "CRISIL", rating: "BBB-/A3", outlook: "—", rationale: "Pre-turnaround baseline." },
    { date: "2023-09-27", agency: "CRISIL", rating: "BBB+/A2", outlook: "Positive", rationale: "Upgrade after repaying term debt via ~₹2,000 Cr QIP." },
    { date: "2024-03-26", agency: "CRISIL", rating: "A-/A2+", outlook: "Positive", rationale: "Improving WTG margins, O&M cash flow, order-book uptick." },
    { date: "2024-12-31", agency: "CRISIL", rating: "A", outlook: "Positive", rationale: "Second upgrade in 2024; improved WTG EBITDA margin." },
    { date: "2025-07-29", agency: "CRISIL", rating: "A+", outlook: "Stable", rationale: "Scale, revenue visibility, strong liquidity." },
    { date: "2025-07-29", agency: "ICRA", rating: "A+", outlook: "Stable", rationale: "Order book 3.66 GW FY25 vs ~0.5 GW/yr FY21–23. Notes two historical restructurings (2013, 2020–21)." },
  ],

  discrepancies: [
    {
      id: "jun-2025-revenue",
      metric: "Revenue",
      period: "Jun 2025",
      unit: "₹ Cr",
      observations: [
        { sourceId: "screener", sourceName: "Screener.in", trust: 85, value: 3132, note: "Consolidated quarterly sales" },
        { sourceId: "blinkx", sourceName: "BlinkX (Nuvama Wealth)", trust: 65, value: 3165, note: "Broker recomputation of the same quarter" },
      ],
      spreadPct: 1.1,
      preferredSourceId: "screener",
      reliedWhy:
        "Screener rebuilds from BSE/NSE filings (trust 85) vs a broker tracker (trust 65). A 1.1% spread does not change leverage or coverage. Flagged so the memo is auditable.",
    },
    {
      id: "jun-2025-ebitda",
      metric: "EBITDA / operating profit",
      period: "Jun 2025",
      unit: "₹ Cr",
      observations: [
        { sourceId: "screener", sourceName: "Screener.in", trust: 85, value: 599, note: "Operating profit on Screener" },
        { sourceId: "blinkx", sourceName: "BlinkX (Nuvama Wealth)", trust: 65, value: 632.54, note: "BlinkX EBITDA, same quarter" },
      ],
      spreadPct: 5.6,
      preferredSourceId: "screener",
      reliedWhy:
        "A 5.6% EBITDA gap would move quarterly margin. We keep the filing-derived Screener series used for the rest of the time series. Annual Debt/EBITDA and coverage are scored on FY figures, not this quarter.",
    },
    {
      id: "net-debt",
      metric: "Net debt / (net cash)",
      period: "Mar 2025 vs Sep 2025",
      unit: "₹ Cr",
      observations: [
        { sourceId: "screener", sourceName: "Screener.in", trust: 85, value: 323, note: "FY25 gross borrowings — Screener has no net-debt line" },
        { sourceId: "tijori", sourceName: "Tijori Finance", trust: 70, value: -1941.55, note: "Mar-25 net cash (Tijori)" },
        { sourceId: "tijori", sourceName: "Tijori Finance", trust: 70, value: -380.88, note: "Sep-25 net cash; cushion shrank ~5x in two quarters" },
      ],
      spreadPct: null,
      preferredSourceId: "screener",
      reliedWhy:
        "Debt/EBITDA uses Screener gross borrowings because the definition is disclosed and consistent FY21–FY26. Tijori net cash is a liquidity overlay; its method is unpublished, so it is not the ratio denominator.",
    },
  ],
};
