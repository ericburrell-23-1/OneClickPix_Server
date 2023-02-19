const Joi = require("joi");

shippingAddressJoiSchema = Joi.object({
  shippingName: Joi.string().min(5).max(60).required(),
  phone: Joi.phone
    .string()
    .phoneNumber({ defaultCountry: "US", format: "national" })
    .required(),
  addressLine1: Joi.string().required(),
  addressLine2: Joi.string(),
  city: Joi.string().required(),
  state: Joi.string().length(2).uppercase(),
  country: Joi.string().required(),
  zipCode: Joi.string()
    .length(5)
    .pattern(/^[0-9]+$/),
});

module.exports = shippingAddressJoiSchema;
