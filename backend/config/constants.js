module.exports = {
  LOAN_AMOUNT_CR: 1,
  PORT: process.env.PORT || 3001,
  VERDICT: {
    APPROVE: "APPROVE",
    APPROVE_WITH_CONDITIONS: "APPROVE_WITH_CONDITIONS",
    DECLINE: "DECLINE",
  },
  SIGNAL_WEIGHTS: {
    debtEbitda: 0.25,
    interestCoverage: 0.2,
    receivableDays: 0.2,
    cfoVsProfit: 0.2,
    workingCapital: 0.15,
  },
};
