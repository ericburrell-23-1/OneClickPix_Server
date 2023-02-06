const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const validate = require("../../middleware/validation");
const User = require("../../models/mongoose/user").Model;
const authJoiSchema = require("../../models/joi/auth");

router.post("/", validate(authJoiSchema), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  // Validate password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  // Return a JSON web token
  const token = user.generateAuthToken();
  res.send(token);
});

module.exports = router;
