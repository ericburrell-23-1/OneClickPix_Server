const mongoose = require("mongoose");

const productSnapshotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
  },
  multiPhoto: {
    type: Boolean,
    required: true,
  },
  variantLabel: {
    type: String,
    required: true,
    trim: true,
  },
  x: {
    type: Number,
    required: true,
    min: 0.5,
    max: 60,
  },
  y: {
    type: Number,
    required: true,
    min: 0.5,
    max: 60,
  },
  z: {
    type: Number,
    default: 0,
    min: 0,
    max: 60,
  },
  weight: {
    type: Number,
    min: 0,
  },
});

const orderItemSchema = mongoose.Schema({
  product: {
    type: productSnapshotSchema,
    required: true,
  },
  imageNames: {
    type: [String],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 999,
  },
});

orderItemSchema.pre("validate", function (next) {
  if (!this.product.multiPhoto && this.imageNames.length !== 1) {
    return next(
      new Error("Expected exactly one image for single-photo product")
    );
  }
  if (this.product.multiPhoto && this.imageNames.length < 2) {
    return next(new Error("Expected multiple images for multi-photo product"));
  }
  next();
});

const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productVariant: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  imageNames: {
    type: [String],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 999,
  },
});

module.exports.orderItemSchema = orderItemSchema;
module.exports.cartItemSchema = cartItemSchema;
