const winston = require("winston");
const config = require("config");
const express = require("express");
const app = express();

require("./startup/logging")();
require("./startup/validation")();
require("./startup/database")();
require("./startup/routes")(app);

app.get("/", (req, res) => {
  res.send("Welcome to One Click Pix App :)");
});

// PORT
const port = process.env.PORT || 3000;
const server = app.listen(port, config.get("networkIP"), () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = server;
