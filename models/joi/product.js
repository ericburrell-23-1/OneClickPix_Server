const Joi = require("joi");

const variantJoiSchema = Joi.object({
  label: Joi.string().max(255).required(),
  price: Joi.number().min(0).required(),
  x: Joi.number().positive().required(),
  y: Joi.number().positive().required(),
  z: Joi.number().min(0), // Only required in sized+3d — validated in Mongoose
  weight: Joi.number().min(0),
  isActive: Joi.bool(),
  imageOverride: Joi.string().max(1024),
});

const productJoiSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().min(5).max(1024).required(),
  productGroups: Joi.array().items(Joi.objectId()),
  variantType: Joi.string().max(8).required(),
  multiPhoto: Joi.bool(),
  variants: Joi.array().items(variantJoiSchema).required(),
  imageName: Joi.string().max(1024),
});

module.exports = productJoiSchema;
