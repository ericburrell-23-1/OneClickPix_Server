const debug = require("debug")("app:dev");
const express = require("express");
const router = express.Router();
const ProductGroup = require("../../models/mongoose/productGroup").Model;
const productGroupJoiSchema = require("../../models/joi/productGroup");
const validate = require("../../middleware/validation");
const validateObjectId = require("../../middleware/validateObjectId");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images/marketing/productGroups");
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
  [auth, admin, upload.single("image"), validate(productGroupJoiSchema)],
  async (req, res) => {
    req.body.imageName = req.header["x-image-name"];
    const productGroup = new ProductGroup(req.body);
    const result = await productGroup.save();
    res.send(result);
  }
);

// Get all productGroups
router.get("/", async (req, res) => {
  let productGroups = await ProductGroup.find({}).sort("name");
  res.send(productGroups);
});

// Get a productGroup by ID
router.get("/:id", validateObjectId, async (req, res) => {
  const productGroup = await ProductGroup.findById(req.params.id);
  if (!productGroup)
    return res.status(404).send("Product Group with the given ID not found");
  res.send(productGroup);
});

// Put productGroup by ID
router.put(
  "/:id",
  [validateObjectId, auth, admin, validate(productGroupJoiSchema)],
  async (req, res) => {
    const productGroup = await ProductGroup.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!productGroup)
      res.status(404).send("ProductGroup with the given ID not found");
    else res.send(productGroup);
  }
);

// Delete productGroup by ID
router.delete("/:id", [validateObjectId, auth, admin], async (req, res) => {
  const productGroup = await ProductGroup.findByIdAndRemove(req.params.id);
  if (!productGroup)
    res.status(404).send("ProductGroup with the given ID not found");
  else res.send(productGroup);
});

module.exports = router;
