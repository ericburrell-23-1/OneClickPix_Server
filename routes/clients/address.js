const express = require("express");
const router = express.Router();
// const _ = require("lodash");
const auth = require("../../middleware/auth");
const validate = require("../../middleware/validation");
const User = require("../../models/mongoose/user").Model;
const addressJoiSchema = require("../../models/joi/shippingAddress");

// Used to add an address to a user's saved addresses
router.post("/", [auth, validate(addressJoiSchema)], async (req, res) => {
  let user = await User.findById(req.user._id);
  if (!user) return res.status(404).send("User not found");
  user.addresses.push(req.body);
  const result = await user.save();
  res.send(result.addresses[result.addresses.length - 1]);
});

module.exports = router;
