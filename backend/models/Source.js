const mongoose = require("mongoose");

const sourceSchema = new mongoose.Schema(
  {
    sourceId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["REGULATORY", "EXCHANGE", "FINANCIAL", "RATING_AGENCY", "OTHER"],
      required: true,
    },
    url: String,
    trustScore: { type: Number, min: 0, max: 100, default: 50 },
    why: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Source", sourceSchema);
