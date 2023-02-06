const Joi = require("joi");

productSizeJoiSchema = Joi.object({
  x: Joi.number().min(0.5).max(56).required(),
  y: Joi.number().min(0.5).max(56).required(),
  z: Joi.number().min(0).max(56),
});

module.exports = productSizeJoiSchema;
