const mongoose = require("mongoose");
const shippingAddressSchema = require("./shippingAddress").schema;

const customerSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true,
  },
});

module.exports.schema = customerSchema;
