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
  addresses: {
    type: [shippingAddressSchema],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // optional for guest checkouts
  },
});

customerSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: { user: { $type: "objectId" } },
  }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports.Model = Customer;
module.exports.schema = customerSchema;
