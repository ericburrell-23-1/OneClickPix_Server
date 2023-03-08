const mongoose = require("mongoose");
const productSchema = require("./product").schema;
const productSizeSchema = require("./productSize").schema;

const orderItemSchema = mongoose.Schema({
  product: {
    type: productSchema,
    required: true,
  },
  productSize: {
    type: productSizeSchema,
    required: true,
  },
  imageName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 99,
  },
});

const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  productSize: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  imageName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 99,
  },
});

module.exports.orderItemSchema = orderItemSchema;
module.exports.cartItemSchema = cartItemSchema;
