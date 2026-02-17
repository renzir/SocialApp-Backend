const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateEmailVerifyToken(userid) {
  return jwt.sign({ userid }, process.env.EMAIL_VERIFY_SECRET, {
    expiresIn: "15m",
  });
}

module.exports = generateEmailVerifyToken;
