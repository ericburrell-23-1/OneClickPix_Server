const express = require("express");
const router = express.Router();
const validate = require("../../middleware/validation");
const itemJoiSchema = require("../../models/joi/item");
const Cart = require("../../models/mongoose/cart").Model;
const _ = require("lodash");

router.put("/add-to-cart", validate(itemJoiSchema), async (req, res) => {
  console.log(req.body);
  req.session.cookie.expires = NewExpirationDate();
  if (!req.session.cart) {
    req.session.cart = new Cart();
    req.session.cart.items[0] = req.body;
    return res
      .set("x-cart-message", "Cart created; item added to cart!")
      .send(req.session.cart);
  }

  for (item of req.session.cart.items) {
    if (
      _.isEqual(
        _.pick(item, [
          "product",
          "productSize",
          "imageURL",
          "finishingOptions",
        ]),
        _.pick(req.body, [
          "product",
          "productSize",
          "imageURL",
          "finishingOptions",
        ])
      )
    ) {
      item.quantity += req.body.quantity;
      return res
        .set("x-cart-message", "Item incremented!")
        .send(req.session.cart);
    }
  }
  await req.session.cart.items.push(req.body);
  return res
    .set("x-cart-message", "Item added to cart!")
    .send(req.session.cart);
});

router.put("/remove-from-cart", validate(itemJoiSchema), (req, res) => {
  req.session.cookie.expires = NewExpirationDate();
  if (!req.session.cart) {
    return res.status(404).send("No cart found for this session.");
  }
  for (index in req.session.cart.items) {
    let item = req.session.cart.items[index];
    if (
      _.isEqual(
        _.pick(item, [
          "product",
          "productSize",
          "imageURL",
          "finishingOptions",
        ]),
        _.pick(req.body, [
          "product",
          "productSize",
          "imageURL",
          "finishingOptions",
        ])
      )
    ) {
      item.quantity -= req.body.quantity;
      if (item.quantity < 1) {
        req.session.cart.items.splice(index, 1);
        return res
          .set("x-cart-message", "Item removed from cart.")
          .send(req.session.cart);
      }
      return res
        .set("x-cart-message", "Item decremented.")
        .send(req.session.cart);
    }
  }
  res.status(400).send("Cannot remove item from cart: item not found in cart.");
});

router.delete("/clear-cart", (req, res) => {
  if (!req.session.cart) {
    return res.status(400).send("Cart not created");
  }
  req.session.cart.items = [];
  res.set("x-cart-message", "Cart cleared.").send(req.session.cart);
});

router.get("/", (req, res) => {
  req.session.cookie.expires = NewExpirationDate();
  if (!req.session.cart) {
    req.session.cart = new Cart();
    return res.set("x-cart-message", "Cart is empty.").send(req.session.cart);
  }
  return res.set("x-cart-message", "Cart sent in body.").send(req.session.cart);
});

module.exports = router;

function NewExpirationDate() {
  return new Date(new Date().getTime() + 13 * 24 * 60 * 60 * 1000);
}
