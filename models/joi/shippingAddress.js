const Joi = require("joi");

const shippingAddressJoiSchema = Joi.object({
  shippingName: Joi.string().min(5).max(120).required(),
  phone: Joi.phone
    .string()
    .phoneNumber({ defaultCountry: "US", format: "national" })
    .required(),
  addressLine1: Joi.string().max(1024).required(),
  addressLine2: Joi.string().max(1024),
  city: Joi.string().max(120).required(),
  state: Joi.string().when("country", {
    is: Joi.string().valid("United States", "USA", "US", "Canada").required(),
    then: Joi.string().length(2).uppercase().required(),
    otherwise: Joi.string().max(60).optional(), // Allow empty for non-US/Canada
  }),
  country: Joi.string().max(60).required(),
  zipCode: Joi.string().when("country", {
    is: Joi.string().valid("United States", "USA", "US", "Canada").required(),
    then: Joi.string()
      .length(5)
      .pattern(/^[0-9]+$/)
      .required(), // US/Canada zip code format
    otherwise: Joi.string().max(30).optional(), // Allows any value for non-US/Canada
  }),
});

module.exports = shippingAddressJoiSchema;
