require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectDB } = require("./config/db.js");
const authRoutes = require("./routes/auth.js");
// const dashboardRoutes = require('./routes/dashboard');
const usersRoutes = require("./routes/users.js");

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Connect to MongoDB
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB", err);
  process.exit(1);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/users", usersRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
app.get("/", async (req, res) => {
  res.send("Westfert server is running");
});
