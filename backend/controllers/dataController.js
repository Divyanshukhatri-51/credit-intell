const FinancialData = require("../models/FinancialData");
const Company = require("../models/Company");
const { mongoReady } = require("../config/database");

exports.addFinancialData = async (req, res) => {
  try {
    if (!mongoReady()) {
      return res.status(503).json({ error: "MongoDB required for writes" });
    }
    const { companyId } = req.params;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const financialData = await FinancialData.create({
      ...req.body,
      companyId,
    });
    res.status(201).json(financialData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getFinancialData = async (req, res) => {
  try {
    if (!mongoReady()) {
      return res.status(503).json({ error: "MongoDB required" });
    }
    const data = await FinancialData.find({ companyId: req.params.companyId }).sort({
      year: 1,
    });
    res.json({ count: data.length, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.bulkUploadFinancialData = async (req, res) => {
  try {
    if (!mongoReady()) {
      return res.status(503).json({ error: "MongoDB required for writes" });
    }
    const { companyId, dataArray } = req.body;
    if (!companyId || !Array.isArray(dataArray)) {
      return res.status(400).json({ error: "Provide companyId and dataArray" });
    }
    const result = await FinancialData.insertMany(
      dataArray.map((row) => ({ ...row, companyId }))
    );
    res.status(201).json({ message: `${result.length} records added`, count: result.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
