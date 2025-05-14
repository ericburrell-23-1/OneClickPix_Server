const debug = require("debug")("app:dev");
const winston = require("winston");
const express = require("express");
const router = express.Router();
const Product = require("../../models/mongoose/product").Model;
const ProductGroup = require("../../models/mongoose/productGroup").Model;
const productJoiSchema = require("../../models/joi/product");
const validate = require("../../middleware/validation");
const validateObjectId = require("../../middleware/validateObjectId");
const findReferences = require("../../middleware/findReferences").findMany;
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images/marketing/products");
  },
  filename: (req, file, cb) => {
    console.log(file);
    const imageName =
      path.parse(file.originalname).name +
      "-" +
      Date.now() +
      path.extname(file.originalname);
    req.header["x-image-name"] = imageName;
    cb(null, imageName);
  },
});
const upload = multer({ storage: storage });

router.post(
  "/",
  [auth, admin, upload.single("image"), validate(productJoiSchema)],
  async (req, res) => {
    // debug("Middleware completed, saving new product now...");
    req.body.imageName = req.header["x-image-name"];
    debug(req.body.imageName);
    try {
      const product = new Product(req.body);
      // debug("Product saved to db");
      const result = await product.save();
      res.status(200).send(result);
    } catch (err) {
      // winston.error("Caught error:", err);
      if (err.name === "ValidationError" || err.name === "Error") {
        const errors = {};
        for (const field in err.errors) {
          errors[field] = err.errors[field].message;
        }
        return res.status(400).send(err.message);
      }
      res.status(500).send(err.message);
    }
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
    // findReferences([ProductGroup]),
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
