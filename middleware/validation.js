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
