const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db.js");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

// Register
router.post("/register", async (req, res) => {
  const { userName, email, password, designation } = req.body;
  console.log(req.body);
  try {
    const db = getDB();
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      userName,
      email,
      password: hashedPassword,
      designation,
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(user);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password, remember } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const db = getDB();
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const expiresIn = remember ? "7d" : "1h";
    const jwtExpiresMs = remember ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userName: user.userName,
        designation: user.designation,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn }
    );

    // Set cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: jwtExpiresMs,
    });

    res.status(200).json({
      message: "Sign in successful",
      // optional, send back non-sensitive data if needed
      user: {
        email: user.email,
        userName: user.userName,
        designation: user.designation,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
