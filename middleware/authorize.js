const winston = require("winston");
const Customer = require("../models//mongoose/customer").Model;
const mongoose = require("mongoose");

/**
 * Middleware generator that verifies the authenticated user has rights to act on the provided customer.
 *
 * @param {mongoose.ObjectId|string} [customerId] - Optional customer ID to verify; defaults to `req.body.customer`.
 * @returns {function} Middleware that assigns `req.body.user = req.user._id`, then:
 *   - calls `next()` if the user is an admin or owns the customer,
 *   - responds with 403 if unauthorized,
 *   - responds with 400 if the customer doesn't exist or on error.
 */
module.exports = (customerId) => {
  return async function (req, res, next) {
    try {
      const userId = req.user._id;
      const userIsAdmin = req.user.isAdmin;
      req.body.user = userId;

      const targetCustomerId = customerId || req.body.customer;
      const customer = await Customer.findById(targetCustomerId);
      if (!customer) {
        const msg = `Customer with ID ${targetCustomerId} not found.`;
        winston.error(msg);
        return res.status(400).send(msg);
      }
      if (userIsAdmin || (customer.user && customer.user.equals(userId)))
        return next();

      const msg = `User ${userId} not authorized to access customer ${targetCustomerId}.`;
      winston.error(msg);
      return res.status(403).send(msg);
    } catch (err) {
      winston.error(`Authorization check failed: ${err.message}`);
      return res.status(400).send(`Authorization error: ${err.message}`);
    }
  };
};
