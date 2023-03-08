const mongoose = require("mongoose");
const customerSchema = require("./customer").schema;
const orderItemSchema = require("./item").orderItemSchema;
// const shippingSchema = require("./shippingAddress").schema;

const orderSchema = mongoose.Schema({
  customer: {
    type: customerSchema,
    required: true,
  },
  // shippingAddress: {
  //   type: shippingSchema,
  //   required: true,
  // },
  items: [
    {
      type: orderItemSchema,
      required: true,
    },
  ],
  orderDate: {
    type: String,
    default: () => {
      return new Date().toLocaleString("en-US", {
        timeZone: "America/Chicago",
      });
    },
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports.Model = Order;
module.exports.schema = orderSchema;
