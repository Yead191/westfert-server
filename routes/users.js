const jwt = require("jsonwebtoken");
const express = require("express");
const { getDB } = require("../config/db.js");
const router = express.Router();

// Helper function to get the user collection safely
const getUserCollection = () => {
  const db = getDB();
  return db.collection("users");
};

// Route to get user profile by email
router.get("/profile", async (req, res) => {
  const token = req.cookies.authToken;
  // console.log(token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // const db = getDB();
    const userCollection = getUserCollection();
    const user = await userCollection.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log(user);
    // Only return safe fields
    res.json({
      uid: user._id,
      name: user.userName,
      designation: user.designation,
      createdAt: user.createdAt,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
