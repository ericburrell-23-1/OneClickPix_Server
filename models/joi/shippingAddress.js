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
  state: Joi.string().when("country", {
    is: Joi.string().valid("United States", "USA", "US", "Canada").required(),
    then: Joi.string().length(2).uppercase().required(),
    otherwise: Joi.string().optional(), // Allow empty for non-US/Canada
  }),
  country: Joi.string().required(),
  zipCode: Joi.string().when("country", {
    is: Joi.string().valid("United States", "USA", "US", "Canada").required(),
    then: Joi.string()
      .length(5)
      .pattern(/^[0-9]+$/)
      .required(), // US/Canada zip code format
    otherwise: Joi.string().optional(), // Allows any value for non-US/Canada
  }),
});

module.exports = shippingAddressJoiSchema;
