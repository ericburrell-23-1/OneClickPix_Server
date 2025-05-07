const Joi = require("joi");

itemJoiSchema = Joi.object({
  product: Joi.objectId().required(),
  productSize: Joi.objectId().required(),
  imageURL: Joi.string().required(),
  quantity: Joi.number().min(1).max(99).required(),
  finishingOptions: Joi.objectId(),
});

module.exports = itemJoiSchema;
