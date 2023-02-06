const mongoose = require("mongoose");

const productSizeSchema = mongoose.Schema({
  x: {
    type: Number,
    required: true,
    min: 0.5,
    max: 56,
  },

  y: {
    type: Number,
    required: true,
    min: 0.5,
    max: 56,
  },

  z: {
    type: Number,
    default: 0,
    min: 0,
    max: 56,
  },
});

const ProductSize = mongoose.model("ProductSize", productSizeSchema);

module.exports.Model = ProductSize;
module.exports.schema = productSizeSchema;
