const mongoose = require("mongoose");

const shippingAddressSchema = mongoose.Schema({
  shippingName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    validate: {
      validator: function (value) {
        if (
          this.country === "United States" ||
          this.country === "USA" ||
          this.country === "US" ||
          this.country === "Canada"
        ) {
          return value && value.length === 2; // require 2-letter state code
        }
        return true; // don't require or validate for non-US countries
      },
      message:
        "State is required and must be 2 characters if country is United States.",
    },
  },
  country: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    validate: {
      validator: function (value) {
        const country = this.country.toLowerCase();

        if (
          country === "united states" ||
          country === "usa" ||
          country === "us"
        ) {
          // US ZIP code: 5 digits
          return /^\d{5}$/.test(value);
        } else if (country === "canada") {
          // Canadian postal code: A1A 1A1 format
          return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(value);
        } else {
          return (
            value === undefined || value === null || value.trim().length > 0
          );
        }
      },
      message: "Invalid zip/postal code format for the selected country.",
    },
  },
});

module.exports.schema = shippingAddressSchema;
