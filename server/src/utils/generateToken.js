const jwt = require("jsonwebtoken");
dotenv = require("dotenv");
dotenv.config();


const generateAccessToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

const generateRefreshToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
};



module.exports = {
  generateAccessToken,
  generateRefreshToken,
};