const Company = require("../models/Company");
const FinancialData = require("../models/FinancialData");
const Source = require("../models/Source");
const pack = require("../data/suzlon");
const { mongoReady } = require("../config/database");
const memory = require("../config/memoryStore");

function toFrontendSources() {
  return pack.sources.map((s) => ({
    id: s.sourceId,
    name: s.name,
    type: s.type,
    url: s.url,
    trust: s.trustScore,
    why: s.why,
  }));
}

function annualsFromRows(rows) {
  return [...rows]
    .sort((a, b) => a.year - b.year)
    .map((d) => ({
      fy: d.fy,
      sales: d.sales,
      ebitda: d.ebitda,
      interest: d.interest,
      pbt: d.pbt,
      netProfit: d.netProfit,
      borrowings: d.borrowings,
      cfo: d.cfo,
      debtorDays: d.debtorDays,
      wcDays: d.wcDays,
      cashConvCycle: d.cashConvCycle,
      roce: d.roce,
    }));
}

function companyPayload(company, annuals) {
  return {
    slug: company.slug,
    name: company.name,
    ticker: company.ticker,
    exchange: company.exchange,
    sector: company.sector,
    description: company.description,
    website: company.website,
    sources: company.sources?.length ? company.sources : toFrontendSources(),
    annuals,
    quarters: company.quarters || pack.quarters,
    ratings: company.ratings || pack.ratings,
    discrepancies: company.discrepancies || pack.discrepancies,
  };
}

function seedMemory() {
  memory.reset();
  const company = { _id: "mem-suzlon", ...pack.profile };
  company.sources = toFrontendSources();
  company.quarters = pack.quarters;
  company.ratings = pack.ratings;
  company.discrepancies = pack.discrepancies;
  memory.companies.set("suzlon", company);
  memory.financials.set("suzlon", pack.annuals);
  pack.sources.forEach((s) => memory.sources.push(s));
  return company;
}

async function seedMongo() {
  await Company.deleteMany({ slug: "suzlon" });
  await FinancialData.deleteMany({});
  await Source.deleteMany({});

  const company = await Company.create({
    ...pack.profile,
    sources: toFrontendSources(),
    quarters: pack.quarters,
    ratings: pack.ratings,
    discrepancies: pack.discrepancies,
  });

  await FinancialData.insertMany(
    pack.annuals.map((row) => ({
      companyId: company._id,
      period: "ANNUAL",
      ...row,
      source: {
        name: "Screener.in",
        url: "https://www.screener.in/company/SUZLON/consolidated/",
        trustScore: 85,
      },
    }))
  );

  await Source.insertMany(pack.sources);
  return company;
}

exports.seedMemory = seedMemory;
exports.seedMongo = seedMongo;

exports.getAllCompanies = async (req, res) => {
  try {
    if (!mongoReady()) {
      if (!memory.companies.size) seedMemory();
      const list = [...memory.companies.values()].map(
        ({ annuals, quarters, discrepancies, ...rest }) => rest
      );
      return res.json(list);
    }
    const companies = await Company.find().select(
      "slug name ticker exchange sector description"
    );
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCompanyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!mongoReady()) {
      if (!memory.companies.size) seedMemory();
      const company = memory.companies.get(slug);
      if (!company) return res.status(404).json({ error: "Company not found" });
      return res.json(
        companyPayload(company, annualsFromRows(memory.financials.get(slug) || []))
      );
    }

    const company = await Company.findOne({ slug });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const rows = await FinancialData.find({ companyId: company._id }).sort({
      year: 1,
    });
    const annuals =
      rows.length > 0 ? annualsFromRows(rows) : annualsFromRows(pack.annuals);

    res.json(companyPayload(company, annuals));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCompany = async (req, res) => {
  try {
    if (!mongoReady()) {
      return res.status(503).json({ error: "MongoDB required to create companies" });
    }
    const company = await Company.create(req.body);
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.seedSuzlon = async (req, res) => {
  try {
    if (!mongoReady()) {
      const company = seedMemory();
      return res.json({
        success: true,
        persistence: "memory",
        message: "Suzlon seeded in memory (Mongo unavailable)",
        data: { slug: company.slug, name: company.name },
      });
    }
    const company = await seedMongo();
    res.json({
      success: true,
      persistence: "mongodb",
      message: "Suzlon seeded",
      data: { slug: company.slug, name: company.name },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
