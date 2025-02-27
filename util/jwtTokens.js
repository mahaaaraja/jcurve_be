const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.generateToken = (payload, expireIn, secret) => {
  try {
    if (!payload) {
      return;
    }
    const accessToken = jwt.sign(payload, secret, {
      expiresIn: expireIn,
    });
    return accessToken;
  } catch (err) {
    throw err;
  }
};

exports.verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return { decodedValue: decoded };
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return { err: 'Unauthorized access.' };
      // return { err: err.name };
    } else {
      return { err: 'Unauthorized access.' };
    }
  }
}