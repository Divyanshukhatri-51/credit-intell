const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    ticker: { type: String, required: true, uppercase: true },
    exchange: String,
    sector: String,
    description: String,
    website: String,
    sources: { type: mongoose.Schema.Types.Mixed, default: [] },
    quarters: { type: mongoose.Schema.Types.Mixed, default: [] },
    ratings: { type: mongoose.Schema.Types.Mixed, default: [] },
    discrepancies: { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
