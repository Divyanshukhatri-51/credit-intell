require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, mongoReady } = require("./config/database");
const routes = require("./routes");
const { seedMongo, seedMemory } = require("./controllers/companyController");

const app = express();
const PORT = process.env.PORT || 3001;
const origin = process.env.FRONTEND_ORIGIN;
const allowedOrigins = [origin, "https://credit-intelligence-pi.vercel.app"];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no Origin (like server-to-server) or from allowed origins
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // For origins with trailing slash, normalize before check
    const normalized = origin.replace(/\/*$/, "");
    if (allowedOrigins.includes(normalized)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  }
}));
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
