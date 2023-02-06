const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

userJoiSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().min(6).max(255).required().email(),
  password: passwordComplexity(),
});

module.exports = userJoiSchema;
