const User = require("../models/mongoose/user").Model;
const shippingAddressJoiSchema = require("../models/joi/shippingAddress");
const validate = require("./validation");
const _ = require("lodash");

module.exports = async function (req, res, next) {
  // lookup user from req.user
  let user = await User.findById(req.user._id);

  // return 400 if no address is chosen or none exists
  if (!user.addresses || user.addresses.length == 0)
    return res.status(400).send("No addresses saved to user account");
  if (!req.headers["x-shipping-address-index"])
    return res.status(400).send("No address selected");

  // choose an address by finding address selection in header
  let shippingAddress = user.addresses[req.headers["x-shipping-address-index"]];

  // return 404 if shipping address is not found
  if (!shippingAddress)
    return res.status(404).send("Shipping Address not found in user account");

  // return 400 if shipping address is invalid
  await validate(
    shippingAddressJoiSchema,
    _.pick(shippingAddress, [
      "shippingName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "country",
      "zipCode",
    ])
  )(req, res, () => {});

  // create a customer object with necessary info from user
  const customer = {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: shippingAddress.phone,
    shippingAddress: shippingAddress,
  };

  // add customer object to req.body
  req.body.customer = customer;

  next();
};
