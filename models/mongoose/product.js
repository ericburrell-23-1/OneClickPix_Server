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
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductGroup",
      validate: {
        validator: async function (value) {
          const exists = await mongoose
            .model("ProductGroup")
            .exists({ _id: value });
          return exists !== null;
        },
        message: (props) =>
          `ProductGroup with ID ${props.value} does not exist.`,
      },
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

  if (this.variantType === "sized+3d") {
    for (const v of this.variants) {
      if (typeof v.z !== "number" || v.z <= 0) {
        return next(
          new Error(
            `All variants must have a positive 'z' value when variantType is "sized+3d". Problem with variant "${v.label}".`
          )
        );
      }
      if (typeof v.weight !== "number" || v.weight <= 0) {
        return next(
          new Error(
            `All variants must have a positive 'weight' value when variantType is "sized+3d". Problem with variant "${v.label}".`
          )
        );
      }
    }
  }

  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports.Model = Product;
module.exports.schema = productSchema;
