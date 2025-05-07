const mongoose = require("mongoose");

const productVariantSchema = mongoose.Schema({
  label: {
    type: String, // e.g., "5x7"
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
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  weight: {
    type: Number,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  imageOverride: String,
});

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
      type: mongoose.Types.ObjectId,
      ref: "ProductGroup",
    },
  ],
  variantType: {
    type: String,
    enum: ["one-size", "sized", "sized+3d"],
    default: "sized",
    required: true,
  },
  multiPhoto: {
    type: Boolean,
    default: false,
  },
  variants: {
    type: [productVariantSchema],
    required: true,
  },
  imageName: String,
});

productSchema.index({ "variants.label": 1 });
productSchema.index({ productGroups: 1 });

productSchema.pre("validate", function (next) {
  if (!this.variants || this.variants.length === 0) {
    return next(new Error("Product must have at least one variant."));
  }

  const labels = this.variants.map((v) => v.label);
  const uniqueLabels = new Set(labels);

  if (labels.length !== uniqueLabels.size) {
    return next(new Error("Variant labels must be unique within a product."));
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports.Model = Product;
module.exports.schema = productSchema;
