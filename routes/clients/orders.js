const debug = require("debug")("app:dev");
const winston = require("winston");
const express = require("express");
const router = express.Router();
const Order = require("../../models/mongoose/order").Model;
const Product = require("../../models/mongoose/product").Model;
const User = require("../../models/mongoose/user").Model;
// const ProductSize = require("../../models/mongoose/productSize").Model;
const orderJoiSchema = require("../../models/joi/order");
const itemJoiSchema = require("../../models/joi/item");
const validate = require("../../middleware/validation");
const validateObjectId = require("../../middleware/validateObjectId");
const findReference = require("../../middleware/findReferences").findOne;
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const addCustomerInfoToBody = require("../../middleware/addCustomerInfoToBody");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images/orders");
  },
  filename: (req, file, cb) => {
    const imageName =
      path.parse(file.originalname).name +
      "-" +
      Date.now() +
      path.extname(file.originalname);
    req.header[`x-${file.fieldname}-name`] = imageName;
    cb(null, imageName);
  },
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype != "image/jpeg") return cb(new Error("Wrong file type"));
  if (!file.fieldname.match(/^image[0-9]*$/))
    return cb(new Error("File field not allowed"));
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post(
  "/",
  [auth, upload.any(), validate(orderJoiSchema), addCustomerInfoToBody],
  async (req, res) => {
    for (const [index, item] of req.body.items.entries()) {
      item.imageName = req.header[`x-image${index}-name`];
      validate(itemJoiSchema, item)(req, res, () => {});
      await findReference([Product], item)(req, res, () => {});
    }

    const order = new Order(req.body);
    const result = await order.save();
    winston.info(`New order received: ${result}`);
    res.send(result);
  }
);

// Get all orders
router.get("/", [auth, admin], async (req, res) => {
  const orders = await Order.find({}).sort("orderDate");
  res.send(orders);
});

// // Get an order by ID
// router.get("/:id", validateObjectId, async (req, res) => {
//   const order = await Order.findById(req.params.id);
//   if (!order)
//     return res.status(404).send("Order with the given ID not found");
//   res.send(product);
// });

// // Put order by ID
// router.put(
//   "/:id",
//   [
//     validateObjectId,
//     auth,
//     admin,
//     validate(productJoiSchema),
//     findReferences([Product, ProductSize, User]),
//   ],
//   async (req, res) => {
//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       { new: true }
//     );
//     if (!product) res.status(404).send("Product with the given ID not found");
//     else res.send(product);
//   }
// );

// // Delete order by ID
// router.delete("/:id", [validateObjectId, auth, admin], async (req, res) => {
//   const product = await Product.findByIdAndRemove(req.params.id);
//   if (!product) res.status(404).send("Product with the given ID not found");
//   // debug("Removed product from DB: ", product);
//   else res.send(product);
// });

module.exports = router;
