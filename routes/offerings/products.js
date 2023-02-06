const debug = require("debug")("app:dev");
const express = require("express");
const router = express.Router();
const Product = require("../../models/mongoose/product").Model;
const ProductGroup = require("../../models/mongoose/productGroup").Model;
const ProductSize = require("../../models/mongoose/productSize").Model;
const productJoiSchema = require("../../models/joi/product");
const validate = require("../../middleware/validation");
const validateObjectId = require("../../middleware/validateObjectId");
const findReferences = require("../../middleware/findReferences");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");

router.post(
  "/",
  [
    auth,
    admin,
    validate(productJoiSchema),
    findReferences([ProductGroup, ProductSize]),
  ],
  async (req, res) => {
    // debug("Middleware completed, saving new product now...");
    const product = new Product(req.body);
    // debug("Product saved to db");
    const result = await product.save();
    res.send(result);
  }
);

// Get all products
router.get("/", async (req, res) => {
  const products = await Product.find({}).sort("name");
  res.send(products);
});

// Get a product by ID
router.get("/:id", validateObjectId, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return res.status(404).send("Product with the given ID not found");
  res.send(product);
});

// Put product by ID
router.put(
  "/:id",
  [
    validateObjectId,
    auth,
    admin,
    validate(productJoiSchema),
    findReferences([ProductGroup, ProductSize]),
  ],
  async (req, res) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!product) res.status(404).send("Product with the given ID not found");
    else res.send(product);
  }
);

// Delete product by ID
router.delete("/:id", [validateObjectId, auth, admin], async (req, res) => {
  const product = await Product.findByIdAndRemove(req.params.id);
  if (!product) res.status(404).send("Product with the given ID not found");
  // debug("Removed product from DB: ", product);
  else res.send(product);
});

module.exports = router;
