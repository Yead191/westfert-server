const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.DB_URI;
const client = new MongoClient(uri);

let db;
async function connectDB() {
  try {
    // await client.connect();
    db = client.db("westfertDB");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };
