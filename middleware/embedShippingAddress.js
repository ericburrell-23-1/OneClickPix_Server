const Customer = require("../models/mongoose/customer").Model;
/**
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @param {Function} next - Next middleware function in the Express stack
 * @returns {Void} Returns a 400 error if shipping address is not found, 500 error, else calls next().
 */
module.exports = async (req, res, next) => {
  try {
    const addressId = req.body.shippingAddress;
    // if (!addressId) return res.status(400).send("No shipping address provided");
    const customer = await Customer.findById(req.body.customer);

    const address = customer.addresses.find(
      (a) => a._id.toString() === addressId
    );

    if (!address)
      return res
        .status(400)
        .send("No shipping address found for the provided ID");

    req.body.shippingAddress = address.toObject();
    next();
  } catch (err) {
    console.error("Error embedding shipping address:", err);
    res.status(500).send("Server error while embedding shipping address");
  }
};
