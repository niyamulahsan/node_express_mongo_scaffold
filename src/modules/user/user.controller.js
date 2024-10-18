const bcrypt = require("bcrypt");
const Role = require("../../models/roleSchema");
const User = require("../../models/userSchema");

const user = {};

user.index = async (req, res, next) => {
  try {
    let search = req.query.search || "";
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;
    let skip = limit * (page - 1);

    const countUserData = await User.find().or({ name: { $regex: `.*${search}.*`, $options: 'i' } }).countDocuments();

    let pages = Math.ceil(countUserData / limit);
    let total = countUserData;


    // Do not execute User.find() prematurely: Once you use await, the query is executed, so you need to construct the entire query before calling await.
    // Modify where conditionally: The condition based on req.role should be added before executing the query.
    // Chaining .or() correctly: .or() should be part of the query builder chain before executing the query, not after calling await.

    let query = User.find();

    if (['admin'].includes(req.role)) {
      const roleIdFind = await Role.find().where({ name: "admin" });
      query = query.where('role').ne(roleIdFind[0].id);
    }

    query = query.or([
      { name: { $regex: `.*${search}.*`, $options: 'i' } },
      { email: { $regex: `.*${search}.*`, $options: 'i' } }
    ]).select(['-password', '-forget_password'])
      .populate('role')
      .limit(limit)
      .skip(skip)
      .sort({ updatedAt: -1 });

    const userData = await query.exec(); // after all query generate then use await here

    return res.status(200).json({
      current_page: Number(page),
      per_page: Number(limit),
      total: Number(total),
      from: userData.length > 0 ? Number(skip + 1) : null,
      to: userData.length > 0 ? Number(skip + userData.length) : null,
      last_page: Number(pages),
      search: search,
      result: userData
    });
  } catch (err) {
    next(err);
  }
};

user.store = async (req, res, next) => {
  try {
    const data = {
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
      confirm_password: req.body.confirm_password,
      role: req.body.role,
    };

    data.forget_password = req.body.password;
    data.status = "active";

    delete data["confirm_password"];

    await User.create(data);

    return res.json({ msg: "User created successfully" });
  } catch (err) {
    next(err);
  }
};

user.show = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select(['-password', '-forget_password']).populate('role');

    return res.json({ user: user });
  } catch (err) {
    next(err);
  }
};

user.update = async (req, res, next) => {
  try {
    const data = {
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
      confirm_password: req.body.confirm_password,
      role: req.body.role,
    };

    // check who is logged in
    const auth = await User.findOne({ email: req.email }).select(['-password', '-forget_password']).populate('role');

    if (req.body.password == "" || req.body.password == null) {
      delete data["password"];
      delete data["forget_password"];
    } else {
      if (["user"].includes(auth.role.name)) {
        delete data["role"];
      }
      delete data["email"];
      delete data["confirm_password"];
      data.forget_password = req.body.password;
    }

    await User.updateOne({ _id: req.params.id }, { $set: data });

    return res.json({ msg: "User updated successfully" });
  } catch (err) {
    next(err);
  }
};

user.delete = async (req, res, next) => {
  try {
    const idsToDelete = req.params.id.split(",");

    const roleCheck = await User.find({ _id: { $in: idsToDelete } }).select(['-password', '-forget_password']).populate('role');

    let rolearr = [];
    roleCheck.map(async (role) => {
      if (['user'].includes(role.role.name)) {
        rolearr.push(role._id);
      }
    });

    await User.deleteMany({ _id: { $in: rolearr } });

    return res.json({ msg: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

user.status = async (req, res, next) => {
  try {
    await User.updateOne(
      { _id: req.params.id },
      { $set: { status: req.body.status } }
    );

    return res.json({ msg: "Status updated" });
  } catch (err) {
    next(err);
  }
};

module.exports = user;
