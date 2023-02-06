const Joi = require("joi");

// Joi schema
authJoiSchema = Joi.object({
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(8).max(26).required(),
});

module.exports = authJoiSchema;
