const { check } = require("express-validator");
const Example = require("../../database/models/exampleSchema");

const example = {};

example.storeschema = [
	check("name")
		.notEmpty()
		.withMessage("Name required")
		.isLength({ max: 20 })
		.withMessage("Max 20 char")
		.bail()
		.custom(async (value) => {
			const checkdata = await Example.findOne({
				name: { $regex: value, $options: "i" },
			});

			if (checkdata) {
				return Promise.reject("Already exists");
			}
			return Promise.resolve();
		}),
];

example.updatechema = [
	check("name")
		.notEmpty()
		.withMessage("Name required")
		.isLength({ max: 20 })
		.withMessage("Max 20 char")
		.custom(async (value) => {
			const checkdata = await Example.findOne({
				name: { $regex: value, $options: "i" },
			});

			if (checkdata) {
				return Promise.reject("Already exists");
			}
			return Promise.resolve();
		}),
];

module.exports = example;
