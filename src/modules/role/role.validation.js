const { check } = require("express-validator");
const Role = require("../../models/roleSchema");

const role = {};

role.storeschema = [ // currently not use in route
  check("name")
    .notEmpty()
    .withMessage("Name required")
    .isLength({ max: 20 })
    .withMessage("Max 20 char")
    .bail()
    .custom(async (value) => {
      const checkdata = await Role.findOne({ name: { $regex: `.*${value}.*`, $options: 'i' } });

      if (checkdata) {
        return Promise.reject("Already exists");
      }
      return Promise.resolve();
    }),
];

role.updatechema = [ // currently not use in route
  check("name")
    .notEmpty()
    .withMessage("Name required")
    .isLength({ max: 20 })
    .withMessage("Max 20 char")
    .custom(async (value) => {
      const checkdata = await Role.findOne({ name: { $regex: `.*${value}.*`, $options: 'i' } });

      if (checkdata) {
        return Promise.reject("Already exists");
      }
      return Promise.resolve();
    }),
];

module.exports = role;
