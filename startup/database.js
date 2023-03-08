const mongoose = require("mongoose");
const winston = require("winston");
const config = require("config");

// Make connection to database
module.exports = function () {
  const db = config.get("database");
  mongoose
    .set("strictQuery", true)
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => winston.info(`Connected to ${db}...`));

  return mongoose.connection.getClient();
};
