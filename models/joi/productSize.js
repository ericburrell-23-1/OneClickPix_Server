const Joi = require("joi");

productSizeJoiSchema = Joi.object({
  x: Joi.number().min(0.5).max(60).required(),
  y: Joi.number().min(0.5).max(60).required(),
  z: Joi.number().min(0).max(60),
});

module.exports = productSizeJoiSchema;
