const mongoose = require("mongoose");
const productSchema = require("./product").schema;
const productSizeSchema = require("./productSize").schema;

const itemSchema = mongoose.Schema({
  product: {
    type: productSchema,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 99,
  },
  productSize: {
    type: productSizeSchema,
    required: true,
  },
  imageName: {
    type: String,
    required: true,
  },
});

module.exports.schema = itemSchema;
