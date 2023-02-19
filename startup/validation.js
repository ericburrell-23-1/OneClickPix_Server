const Joi = require("joi");

module.exports = function () {
  Joi.objectId = require("joi-objectid")(Joi);
  Joi.phone = Joi.extend(require("joi-phone-number"));
};
