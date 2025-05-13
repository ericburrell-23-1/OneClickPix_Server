const Joi = require("joi");
/**
 * Middleware generator that validates a request payload using a Joi schema.
 *
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @param {Object} [obj] - Optional object to validate. Defaults to `req.body` if not provided.
 * @returns {void} Returns a 400 error in the event of validation error, else calls next().
 */
module.exports = (schema, obj) => {
  return (req, res, next) => {
    const validResult = schema.validate(obj || req.body);
    if (validResult.error)
      return res
        .status(400)
        .send(`Error: ${validResult.error.details[0].message}.`);
    next();
  };
};
