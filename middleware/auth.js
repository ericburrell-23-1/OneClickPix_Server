const jwt = require("jsonwebtoken");
const config = require("config");

/**
 * Analyzes JSON Web Token provided in `x-auth-token` header of `req` object. Returns 401 error if no token provided, or 400 for an invalid token.
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @param {Function} next - Next middleware function in the Express stack
 * @returns {void} Returns a 401 error for missing token, 400 error for invalid token, else assigns token data to `req.user` and calls next().
 */
module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded;

    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
