const mongoose = require("mongoose");
const productGroupSchema = require("./productGroup").schema;
const productSizeSchema = require("./productSize").schema;

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 255,
  },
  description: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 1024,
  },
  productGroups: [
    {
      type: productGroupSchema,
      //required: true,
    },
  ],
  productSizes: [
    {
      type: productSizeSchema,
      //required: true,
    },
  ],
});

const Product = mongoose.model("Product", productSchema);

module.exports.Model = Product;
module.exports.schema = productSchema;
