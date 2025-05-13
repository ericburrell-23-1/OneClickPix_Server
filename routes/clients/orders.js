const debug = require("debug")("app:dev");
const winston = require("winston");
const express = require("express");
const router = express.Router();
const Order = require("../../models/mongoose/order").Model;
const Product = require("../../models/mongoose/product").Model;
const User = require("../../models/mongoose/user").Model;
const orderJoiSchema = require("../../models/joi/order");
const { orderItemJoiSchema } = require("../../models/joi/item");
const validate = require("../../middleware/validation");
const validateObjectId = require("../../middleware/validateObjectId");
const findReference = require("../../middleware/findReferences").findOne;
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const addCustomerInfoToBody = require("../../middleware/addCustomerInfoToBody");
const addProductSnapshot = require("../../middleware/addProductSnapshot");
const multer = require("multer");
const path = require("path");
const config = require("config");
const embedShippingAddress = require("../../middleware/embedShippingAddress");
const authorize = require("../../middleware/authorize");

const uploadsDir = config.get("uploadsDir");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!uploadsDir) throw new Error("uploadsDir is undefined or empty");
      cb(null, uploadsDir);
    } catch (err) {
      console.error("Error in multer.destination:", err);
      cb(err); // Pass error to multer so it can send 500
    }
  },
  filename: (req, file, cb) => {
    try {
      const imageName =
        path.parse(file.originalname).name +
        "-" +
        Date.now() +
        path.extname(file.originalname);

      if (!req.imageNames) req.imageNames = {};
      req.imageNames[file.originalname] = imageName;

      cb(null, imageName);
    } catch (err) {
      console.error("Error in multer.filename:", err);
      cb(err);
    }
  },
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype !== "image/jpeg") {
    console.error("Rejected due to wrong MIME type:", file.mimetype);
    return cb(new Error("Wrong file type"));
  }

  if (!file.fieldname.match(/^images[0-9]*$/)) {
    console.error("Rejected due to unexpected field name:", file.fieldname);
    return cb(new Error("File field not allowed"));
  }

  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

const decodeOrderPayload = (req, res, next) => {
  try {
    req.body = JSON.parse(req.body.order);
    // console.log(req.body);
    next();
  } catch (err) {
    return res.status(400).send("Invalid order payload format.");
  }
};

router.post(
  "/",
  [
    auth,
    authorize(/* args */),
    upload.any(),
    decodeOrderPayload,
    validate(orderJoiSchema),
    embedShippingAddress,
    addProductSnapshot,
  ],
  async (req, res) => {
    try {
      // console.log("req.files:", req.files);
      // console.log("req.headers:", req.headers);

      // console.log("req.body:", req.body);

      // const validationError = orderJoiSchema.validate(req.body);
      // if (validationError.error) {
      //   console.log("Joi order schema validation failed");
      //   return res.status(400).send(validationError.error.details[0].message);
      // }
      for (const [index, item] of req.body.items.entries()) {
        const newImageNames = item.imageNames.map((name) => {
          const renamed = req.imageNames[name];
          if (!renamed) {
            console.warn(`Referenced image not found for: ${name}`);
          }
          return renamed || name; // fallback if needed
        });
        // console.log("Original image names:", item.imageNames);
        // console.log("New image names:", newImageNames);
        item.imageNames = newImageNames;

        // await findReference([Product], item)(req, res, () => {});
      }
      const order = new Order(req.body);
      const result = await order.save();
      winston.info(`New order received: ${result}`);
      res.send(result);
    } catch (err) {
      winston.error("Upload error:", err);
      return res.status(400).send("Invalid JSON payload or malformed request.");
    }
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
