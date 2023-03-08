const mongoose = require("mongoose");

const productGroupSchema = mongoose.Schema({
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
  image: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 1024,
  },
});

const ProductGroup = mongoose.model("ProductGroup", productGroupSchema);

module.exports.Model = ProductGroup;
module.exports.schema = productGroupSchema;
