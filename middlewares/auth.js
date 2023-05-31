const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Missing JWT" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid JWT" });
    }

    req.user = decoded.userId;
    next();
  });
};

module.exports = verifyJWT;
