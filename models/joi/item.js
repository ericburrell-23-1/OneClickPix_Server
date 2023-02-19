const Joi = require("joi");

itemJoiSchema = Joi.object({
  product: Joi.objectId().required(),
  productSize: Joi.objectId().required(),
  imageName: Joi.string().required(),
  quantity: Joi.number().min(1).max(99),
  finishingOptions: Joi.objectId(),
});

module.exports = itemJoiSchema;
