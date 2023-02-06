const debug = require("debug")("app:dev");
const express = require("express");
const router = express.Router();
const ProductSize = require("../../models/mongoose/productSize").Model;
const productSizeJoiSchema = require("../../models/joi/productSize");
const validate = require("../../middleware/validation");
const validateObjectId = require("../../middleware/validateObjectId");

router.post("/", validate(productSizeJoiSchema), async (req, res) => {
  const productSize = new ProductSize(req.body);
  const result = await productSize.save();
  res.send(result);
});

// Get all productSizes
router.get("/", async (req, res) => {
  let productSizes = await ProductSize.find({}).sort("name");
  res.send(productSizes);
});

// Get a productSize by ID
router.get("/:id", validateObjectId, async (req, res) => {
  const productSize = await ProductSize.findById(req.params.id);
  if (!productSize)
    return res.status(404).send("Product Size with the given ID not found");
  res.send(productSize);
});

// Put productSize by ID

// Delete productSize by ID

module.exports = router;
