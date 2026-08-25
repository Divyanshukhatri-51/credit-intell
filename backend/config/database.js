const mongoose = require("mongoose");

async function connectDB(uri) {
  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 2500,
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
}

function mongoReady() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDB, mongoReady };
