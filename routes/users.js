const jwt = require("jsonwebtoken");
const express = require("express");
const { getDB } = require("../config/db.js");
const { ObjectId } = require("mongodb");
const router = express.Router();

// Helper function to get the user collection safely
const getUserCollection = () => {
  const db = getDB();
  return db.collection("users");
};

router.get("/", async (req, res) => {
  try {
    const userCollection = getUserCollection();
    const result = await userCollection.find().toArray();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Something went wrong" });
  }
});

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

// update  status
router.patch("/profile/status/:id", async (req, res) => {
  try {
    const userCollection = getUserCollection();
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const { status } = req.body;
    // console.log(status);
    const updatedDoc = {
      $set: {
        status: status,
      },
    };

    const result = await userCollection.updateOne(filter, updatedDoc);

    res.send(result);
  } catch (err) {
    console.error(err); // helpful for debugging
    res.status(500).json({ message: "Something went wrong" });
  }
});

// update profile
router.patch("/profile/update/:id", async (req, res) => {
  try {
    const userCollection = getUserCollection();
    const id = req.params.id;

    const profile = req.body;
    // 1. Get the new fields from request body (ignore empty string fields)
    const updatedFields = Object.fromEntries(
      Object.entries(req.body).filter(
        ([_, value]) => value !== "" || value !== null
      )
    );

    // 2. Fetch the existing user
    const existingUser = await userCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Merge existing profile with updated fields
    // const updatedProfile = {
    //   ...updatedFields,
    // };
    console.log(profile, updatedFields);

    // 4. Update the user in the database
    const result = await userCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedFields }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      modifiedCount: result.modifiedCount,
      updatedFields,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;
