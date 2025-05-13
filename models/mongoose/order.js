const mongoose = require("mongoose");
const orderItemSchema = require("./item").orderItemSchema;
const shippingAddressSchema = require("./shippingAddress").schema;

const orderSchema = mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: [(arr) => arr.length > 0, "Order must contain at least one item"],
  },
  orderDate: {
    type: Date,
    default: () => new Date(),
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports.Model = Order;
module.exports.schema = orderSchema;
