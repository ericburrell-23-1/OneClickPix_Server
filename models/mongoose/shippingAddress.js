const mongoose = require("mongoose");

const shippingSchema = mongoose.Schema({
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
    required: true,
    length: 2,
  },
  country: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
    length: 5,
  },
});

module.exports.schema = shippingSchema;
