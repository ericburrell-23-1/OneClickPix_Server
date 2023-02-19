const Joi = require("joi");

orderJoiSchema = Joi.object({
  items: Joi.array().min(1).required(),
});

module.exports = orderJoiSchema;
