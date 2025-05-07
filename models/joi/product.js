const Joi = require("joi");

const variantJoiSchema = Joi.object({
  label: Joi.string().required(),
  x: Joi.number().positive().required(),
  y: Joi.number().positive().required(),
  z: Joi.number().min(0), // Only required in sized+3d — validated in Mongoose
  price: Joi.number().min(0).required(),
  weight: Joi.number().min(0), // Same
  isActive: Joi.bool(),
  imageOverride: Joi.string(),
});

productJoiSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().min(5).max(1024).required(),
  productGroups: Joi.array().items(Joi.objectId()),
  variantType: Joi.string().required(),
  multiPhoto: Joi.bool(),
  variants: Joi.array().items(variantJoiSchema).required(),
  imageName: Joi.string(),
});

module.exports = productJoiSchema;
