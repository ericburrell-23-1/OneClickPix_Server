const winston = require("winston");
const multer = require("multer");
const upload = multer();
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
const auth = require("./routes/clients/auth");

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Welcome to One Click Pix App :)");
});
app.use("/api/offerings/products", products);
app.use("/api/offerings/productGroups", productGroups);
app.use("/api/offerings/productSizes", productSizes);
app.use("/api/clients/users", users);
app.use("/api/clients/auth", auth);
// PORT
const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = server;
