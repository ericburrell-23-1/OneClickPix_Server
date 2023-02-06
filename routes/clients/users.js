const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const validate = require("../../middleware/validation");
const auth = require("../../middleware/auth");
const User = require("../../models/mongoose/user").Model;
const userJoiSchema = require("../../models/joi/user");
const winston = require("winston");

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) res.status(404).send("User with the given ID not found");
  res.send(_.omit(user.toObject(), ["password", "__v"]));
});

router.post("/", validate(userJoiSchema), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user)
    res.status(400).send("User with this email address already registered.");

  // Hashing password
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  user = await new User(
    _.pick(req.body, ["firstName", "lastName", "email", "password"])
  );
  await user.save();
  winston.info("New user saved to database: ", user.email);
  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "firstName", "lastName", "email"]));
});

module.exports = router;
