const mongoose = require("mongoose");
const cartItemSchema = require("./item").cartItemSchema;

const cartSchema = mongoose.Schema({
  items: [
    {
      type: cartItemSchema,
    },
  ],
  cartDate: {
    type: String,
    default: () => {
      return new Date().toLocaleString("en-US", {
        timeZone: "America/Chicago",
      });
    },
  },
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports.Model = Cart;
module.exports.schema = cartSchema;
