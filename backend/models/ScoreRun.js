const mongoose = require("mongoose");

const scoreRunSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    companySlug: { type: String, index: true },
    asOf: String,
    verdict: {
      type: String,
      enum: ["APPROVE", "APPROVE_WITH_CONDITIONS", "DECLINE"],
      required: true,
    },
    headlineScore: { type: Number, min: 0, max: 100, required: true },
    confidence: { type: Number, min: 0, max: 100, required: true },
    summary: String,
    conditions: [String],
    assumptions: [String],
    signals: { type: mongoose.Schema.Types.Mixed, default: [] },
    qualitative: { type: mongoose.Schema.Types.Mixed, default: [] },
    strengths: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScoreRun", scoreRunSchema);
