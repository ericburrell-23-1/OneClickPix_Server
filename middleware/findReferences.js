const _ = require("lodash");
const debug = require("debug");
// const ProductGroup = require("../models/mongoose/productGroup").Model;

module.exports = (Models) => {
  // Takes an array of models to find db object refrences
  return async (req, res, next) => {
    for (const Model of Models) {
      // Find the property in the request matching the model
      const reqPropertyName = reqPropertyNameCorrespondingTo(Model);

      // Add property to request with empty value if it was not sent
      if (req.body[reqPropertyName]) {
        const reqProperty = req.body[reqPropertyName];

        // Find the objects matching the Object IDs in this req property
        let property = [];
        if (reqProperty.length) {
          for (const id of reqProperty) {
            const instance = await Model.findById(id);
            if (!instance)
              return res
                .status(400)
                .send(`No ${Model.modelName} found for ID ${id}`);
            property.push(instance);
          }
        }

        // Replace IDs in request property with corresponding objects
        req.body[reqPropertyName] = property;
        debug("Updated request property: ", reqPropertyName, req.body);
      }
    }
    next();
  };
};

function reqPropertyNameCorrespondingTo(Model) {
  // Find the name of property in the request corresponding to the Model
  let modelName = Model.modelName;
  modelName = _.camelCase(modelName);
  return modelName + "s";
}
