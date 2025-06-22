const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET_KEY;

const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: "Access token required" });

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
