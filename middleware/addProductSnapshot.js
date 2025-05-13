const Product = require("../models/mongoose/product").Model;
/**
 * Middleware function that creates a product snapshot for each order item in `req.body.items`.
 * It adds this snapshot to the `product` property of each item in the array, replacing the `productID`.
 * Returns a 400 error if the product is not found in the database.
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @param {Function} next - Next middleware function in the Express stack
 * @returns {void} Returns a 400 error in the event of an unfound product or variant, 500 in case of an error, else calls next().
 */
module.exports = async (req, res, next) => {
  try {
    for (const item of req.body.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res
          .status(400)
          .send("One or more requested products could not be found.");
      }

      const variant = product.variants.find(
        (variant) => variant._id.toString() === item.productVariant
      );

      if (!variant) {
        return res
          .status(400)
          .send(
            "The selected product variant could not be found for this product."
          );
      }

      const productSnapshot = {
        name: product.name,
        price: variant.price,
        description: product.description,
        multiPhoto: product.multiPhoto ?? false,
        variantLabel: variant.label,
        x: variant.x,
        y: variant.y,
        ...(variant.z != null && { z: variant.z }),
        ...(variant.weight != null && { weight: variant.weight }),
      };

      item.product = productSnapshot;
    }
    next();
  } catch (err) {
    console.error("Error adding product snapshots:", err);
    res.status(500).send("Server error while adding product snapshots");
  }
};
