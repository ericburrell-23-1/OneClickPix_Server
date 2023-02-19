const winston = require("winston");
const config = require("config");
const express = require("express");
const app = express();

// app.set("view engine", "html");
// app.set("views", "./homePage.html");

require("./startup/logging")();
require("./startup/validation")();
require("./startup/database")();

const products = require("./routes/offerings/products");
const productGroups = require("./routes/offerings/productGroups");
const productSizes = require("./routes/offerings/productSizes");
const users = require("./routes/clients/users");
const orders = require("./routes/clients/orders");
const address = require("./routes/clients/address");
const auth = require("./routes/clients/auth");

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Welcome to One Click Pix App :)");
});
app.use("/api/offerings/products", products);
app.use("/api/offerings/productGroups", productGroups);
app.use("/api/offerings/productSizes", productSizes);
app.use("/api/clients/users", users);
app.use("/api/clients/orders", orders);
app.use("/api/clients/auth", auth);
app.use("/api/clients/address", address);
// PORT
const port = process.env.PORT || 3000;
const server = app.listen(port, config.get("networkIP"), () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = server;
