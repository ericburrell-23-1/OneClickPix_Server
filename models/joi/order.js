const Joi = require("joi");
const { orderItemJoiSchema } = require("./item");
// const shippingAddressJoiSchema = require("./shippingAddress");

const orderJoiSchema = Joi.object({
  customer: Joi.objectId().required(),
  user: Joi.objectId().required(),
  shippingAddress: Joi.objectId(),
  items: Joi.array().items(orderItemJoiSchema).min(1).required(),
});

module.exports = orderJoiSchema;
