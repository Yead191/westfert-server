const { MongoClient } = require("mongodb");

const mongoUrl = process.env.DB_URI;
// console.log(mongoUrl);
const dbName = "westfertDB";

let db;

async function connectDB() {
  try {
    const client = await MongoClient.connect(mongoUrl, {
    //   useUnifiedTopology: true,
    });
    db = client.db(dbName);
    console.log("Connected to MongoDB");
    return db;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

function getDB() {
  if (!db) throw new Error("Database not connected");
  return db;
}

module.exports = { connectDB, getDB };
