const Joi = require("joi");
const shippingAddressJoiSchema = require("./shippingAddress");

const customerJoiSchema = Joi.object({
  name: Joi.string().max(120).required(),
  email: Joi.string().email().required(),
  phone: Joi.phone
    .string()
    .phoneNumber({ defaultCountry: "US", format: "national" })
    .required(),
  addresses: Joi.array().items(shippingAddressJoiSchema).required(),
  user: Joi.objectId(),
});

module.exports = customerJoiSchema;
