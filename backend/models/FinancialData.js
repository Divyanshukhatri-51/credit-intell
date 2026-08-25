const mongoose = require("mongoose");

const financialDataSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    period: { type: String, enum: ["ANNUAL", "QUARTERLY"], required: true },
    fy: { type: String, required: true },
    year: { type: Number, required: true },
    sales: Number,
    expenses: Number,
    ebitda: Number,
    otherIncome: Number,
    interest: Number,
    depreciation: Number,
    pbt: Number,
    netProfit: Number,
    borrowings: Number,
    cfo: Number,
    fcf: Number,
    debtorDays: Number,
    inventoryDays: Number,
    daysPayable: Number,
    cashConvCycle: Number,
    wcDays: Number,
    roce: Number,
    source: {
      name: String,
      url: String,
      trustScore: { type: Number, min: 0, max: 100, default: 85 },
    },
  },
  { timestamps: true }
);

financialDataSchema.index({ companyId: 1, fy: 1 }, { unique: true });

module.exports = mongoose.model("FinancialData", financialDataSchema);
