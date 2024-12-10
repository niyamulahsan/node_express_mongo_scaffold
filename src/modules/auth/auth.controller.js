const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const customError = require("../../global/customError");
const asyncErrorHandler = require("../../global/asyncErrorHandler");

const Role = require("../../database/models/roleSchema");
const User = require("../../database/models/userSchema");
const sendEmail = require("../../global/mailsetup");

const auth = {};

/**
 * user register
 */
auth.register = async (req, res, next) => {
	try {
		const role = await Role.findOne({ name: "user" });

		const data = {
			name: req.body.name,
			email: req.body.email,
			password: await bcrypt.hash(req.body.password, 10),
			confirm_password: req.body.confirm_password,
		};

		data.status = "active";
		data.forget_password = req.body.password;
		data.role = role.id;

		delete data["confirm_password"];

		await User.create(data);

		return res.json({ msg: "Successfully registered" });
	} catch (err) {
		next(err);
	}
};

/**
 * user login function
 */
auth.login = async (req, res, next) => {
	try {
		const data = {
			email: req.body.email,
			password: req.body.password,
		};

		if (req.body.email == "" || req.body.password == "") {
			return res.status(400).json({ msg: "Invalid credential" });
		}

		const userdata = await User.findOne({ email: data.email }).populate("role");

		console.log(userdata);

		if (!userdata) {
			return res.status(400).json({ msg: "Invalid credential" });
		}

		const password = await bcrypt.compare(data.password, userdata.password);

		if (!password) {
			return res.status(400).json({ msg: "Invalid credential" });
		}

		if (userdata.status !== "active") {
			return res.status(400).json({ msg: "Invalid credential" });
		}

		const token = jwt.sign(
			{
				id: userdata.id,
				email: userdata.email,
				role: userdata.role,
				status: userdata.status,
			},
			process.env.TOKEN_SECRET,
			{
				expiresIn: process.env.TOKEN_EXPIRE,
			}
		);

		res.cookie(process.env.COOKIE_NAME, token, {
			httpOnly: true,
			maxAge: process.env.TOKEN_EXPIRE,
		});

		return res.json({
			token: token,
			expiresIn: process.env.TOKEN_EXPIRE / (60 * 60 * 24 * 1000) + " days",
		});
	} catch (err) {
		next(err);
	}
};

/**
 * user logout function
 */
auth.logout = async (req, res, next) => {
	try {
		const token = req.cookies[process.env.COOKIE_NAME];

		if (!token) {
			return res.sendStatus(204);
		}

		res.clearCookie(process.env.COOKIE_NAME);

		return res.status(200).json({ msg: "Logout" });
	} catch (err) {
		next(err);
	}
};

/**
 * user check for authetication
 */
auth.me = async (req, res, next) => {
	try {
		const auth = await User.findOne({ email: req.email })
			.select(["-password", "-forget_password"])
			.populate("role");

		return res.json({ auth: auth });
	} catch (err) {
		next(err);
	}
};

auth.forgetPassword = async (req, res, next) => {
	// 1. GET USER BASED ON POSTED EMAIL
	const user = await User.findOne({ email: req.body.email });

	// 2. GENERATE A RANDOM RESET TOKEN
	const resetToken = user.createResetPpasswordToken();
	await user.save({ validateBeforeSave: false });

	// SEND EMAIL
	const resetUrl = `${req.protocol}://${req.get(
		"host"
	)}/resetpassword/${resetToken}`;
	const message = `We have received a password reset request. Please use the below link to reset your password\n\n${resetUrl}\n\nThis reset password link will be valid only for 10 minutes.`;

	try {
		await sendEmail({
			email: user.email,
			subject: "Password change request received",
			message: message,
		});

		return res.status(200).json({
			status: "success",
			message: "password reset link send to the user email",
		});
	} catch (err) {
		user.password_reset_token = undefined;
		user.password_reset_token_expires = undefined;
		user.save({ validateBeforeSave: false });

		next(
			new customError(
				"There was an error sending password reset email. Please try again later.",
				500
			)
		);
	}
};

auth.resetPassword = asyncErrorHandler(async (req, res, next) => {
	// 1. IF THE USER EXISTS WITH THE GIVEN TOKEN & TOKEN IS NOT EXPIRED
	const token = crypto
		.createHash("sha256")
		.update(req.params.token)
		.digest("hex");
	const user = await User.findOne({
		password_reset_token: token,
		password_reset_token_expires: { $gt: Date.now() },
	});

	if (!user) {
		const error = new customError("Token is invalid or has expired!", 400);
		next(error);
	}

	// 2. RESETING THE USER PASSWORD
	user.password = await bcrypt.hash(req.body.password, 10);
	user.password_reset_token = undefined;
	user.password_reset_token_expires = undefined;
	user.password_changed_at = Date.now();
	user.forget_password = req.body.password;

	user.save({ validateBeforeSave: false });

	// 3. LOGIN THE USER
	const loginToken = jwt.sign(
		{ id: user.id, email: user.email, role: user.role, status: user.status },
		process.env.TOKEN_SECRET,
		{
			expiresIn: process.env.TOKEN_EXPIRE,
		}
	);

	res.cookie(process.env.COOKIE_NAME, loginToken, {
		httpOnly: true,
		maxAge: process.env.TOKEN_EXPIRE,
	});

	return res.json({
		token: loginToken,
		expiresIn: process.env.TOKEN_EXPIRE / (60 * 60 * 24 * 1000) + " days",
	});
});

module.exports = auth;
