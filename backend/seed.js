require("dotenv").config();
const { connectDB } = require("./config/database");
const { seedMongo } = require("./controllers/companyController");

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/verity_credit";
  await connectDB(uri);
  await seedMongo();
  console.log("Seed complete");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
