const express = require("express");
const products = require("../routes/offerings/products");
const productGroups = require("../routes/offerings/productGroups");
const productSizes = require("../routes/offerings/productSizes");
const address = require("../routes/clients/address");
const auth = require("../routes/clients/auth");
const cart = require("../routes/clients/cart");
const orders = require("../routes/clients/orders");
const users = require("../routes/clients/users");
const marketing = require("../routes/offerings/marketing");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/offerings/marketing", marketing);
  app.use("/api/offerings/products", products);
  app.use("/api/offerings/productGroups", productGroups);
  app.use("/api/offerings/productSizes", productSizes);
  app.use("/api/clients/address", address);
  app.use("/api/clients/auth", auth);
  app.use("/api/clients/cart", cart);
  app.use("/api/clients/orders", orders);
  app.use("/api/clients/users", users);
  app.use("/images", express.static("images"));
};
