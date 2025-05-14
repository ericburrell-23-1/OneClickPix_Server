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
const fs = require("fs");

const uploadsDir = config.get("uploadsDir");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!uploadsDir) throw new Error("uploadsDir is undefined or empty");
      cb(null, uploadsDir);
    } catch (err) {
      winston.error("Error in multer.destination:", err);
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
    winston.error("Rejected due to wrong MIME type:", file.mimetype);
    return cb(new Error("Wrong file type"));
  }

  if (!file.fieldname.match(/^images[0-9]*$/)) {
    winston.error("Rejected due to unexpected field name:", file.fieldname);
    return cb(new Error("File field not allowed"));
  }

  cb(null, true);
};

const limits = {
  fileSize: 20 * 1024 * 1024,
  files: 10,
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});

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
    upload.any(),
    decodeOrderPayload,
    validate(orderJoiSchema),
    authorize(),
    embedShippingAddress,
    addProductSnapshot,
  ],
  async (req, res) => {
    try {
      for (const item of req.body.items) {
        const newImageNames = [];
        for (const name of item.imageNames) {
          const renamed = req.imageNames?.[name];
          if (!renamed) {
            winston.error(`Referenced image not found for: ${name}`);
            res.status(400).send(`Referenced image not found for: ${name}`);
            return;
          }
          const filePath = path.join(uploadsDir, renamed);
          if (!fs.existsSync(filePath)) {
            winston.error(`Image file missing on disk for: ${renamed}`);
            res.status(400).send(`Uploaded file not found: ${renamed}`);
            return;
          }
          newImageNames.push(renamed);
        }
        item.imageNames = newImageNames;
      }
      const order = new Order(req.body);
      const result = await order.save();
      winston.info(`New order received: ${result}`);
      res.send(result);
    } catch (err) {
      winston.error("Upload error:", err);
      return res.status(400).send(err.message);
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
