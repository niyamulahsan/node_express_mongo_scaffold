const Role = require("../../models/roleSchema");

const role = {};

role.index = async (req, res, next) => {
  try {
    let search = req.query.search || "";
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;
    let skip = limit * (page - 1);

    const countRoleData = await Role.find().or({ name: { $regex: `.*${search}.*`, $options: 'i' } }).countDocuments();

    let pages = Math.ceil(countRoleData / limit);
    let total = countRoleData;


    const roleData = await Role.find()
      .or({ name: { $regex: `.*${search}.*`, $options: 'i' } })
      .limit(limit)
      .skip(skip)
      .sort({ updatedAt: -1 })
      .exec();

    return res.status(200).json({
      current_page: Number(page),
      per_page: Number(limit),
      total: Number(total),
      from: roleData.length > 0 ? Number(skip + 1) : null,
      to: roleData.length > 0 ? Number(skip + roleData.length) : null,
      last_page: Number(pages),
      result: roleData,
    });
  } catch (err) {
    next(err);
  }
};

role.show = async (req, res, next) => {
  try {
    const roleData = await Role.findOne({ _id: req.params.id });

    return res.json({ role: roleData });
  } catch (err) {
    next(err);
  }
};

module.exports = role;
