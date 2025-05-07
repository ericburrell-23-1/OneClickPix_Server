const Joi = require("joi");

productJoiSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().min(5).max(1024).required(),
  productGroups: Joi.array().items(Joi.objectId()),
  productSizes: Joi.array().items(Joi.objectId()),
  priceList: Joi.array().items(Joi.number()),
  //imageName: Joi.string().required(),
});

module.exports = productJoiSchema;
