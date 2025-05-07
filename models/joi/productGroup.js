const Joi = require("joi");

productGroupJoiSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().min(5).max(1024).required(),
  //imageName: Joi.string().required(),
});

module.exports = productGroupJoiSchema;
