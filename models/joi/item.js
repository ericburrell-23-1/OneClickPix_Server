const Joi = require("joi");

productSnapshotJoiSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  price: Joi.number().required(),
  description: Joi.string().min(5).max(1024).required(),
  multiPhoto: Joi.bool(),
  variantLabel: Joi.string().max(255).required(),
  x: Joi.number().positive().required(),
  y: Joi.number().positive().required(),
  z: Joi.number().min(0),
  weight: Joi.number().min(0),
});

orderItemJoiSchema = Joi.object({
  product: productSnapshotJoiSchema.required(),
  imageNames: Joi.array().items(Joi.string().max(1024).required()).required(),
  quantity: Joi.number().min(1).max(999).required(),
});

cartItemJoiSchema = Joi.object({
  product: Joi.objectId().required(),
  productVariant: Joi.objectId().required(),
  imageNames: Joi.array().items(Joi.string().max(1024).required()).required(),
  quantity: Joi.number().min(1).max(999).required(),
});

module.exports.orderItemJoiSchema = orderItemJoiSchema;
module.exports.cartItemJoiSchema = cartItemJoiSchema;
