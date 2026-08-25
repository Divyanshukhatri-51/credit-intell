require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, mongoReady } = require("./config/database");
const routes = require("./routes");
const { seedMongo, seedMemory } = require("./controllers/companyController");

const app = express();
const PORT = process.env.PORT || 3001;
const origin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(cors({ origin }));
app.use(express.json());

app.use("/api", routes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mongo: mongoReady(),
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

async function boot() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/verity_credit";
  try {
    await connectDB(uri);
    await seedMongo();
    console.log("Suzlon seeded into MongoDB");
  } catch (err) {
    console.warn("Mongo unavailable — in-memory store. " + err.message);
    seedMemory();
  }

  app.listen(PORT, () => {
    console.log(`API http://localhost:${PORT}`);
  });
}

boot();
