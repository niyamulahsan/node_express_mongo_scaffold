const Example = require("../../models/exampleSchema");

const example = {};

example.index = async (req, res, next) => {
  try {
    let search = req.query.search || "";
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;
    let skip = limit * (page - 1);

    const countExampleData = await Example.find().or({ name: { $regex: `.*${search}.*`, $options: 'i' } }).countDocuments();

    let pages = Math.ceil(countExampleData / limit);
    let total = countExampleData;

    let query = Example.find()
      .or({ name: { $regex: `.*${search}.*`, $options: 'i' } })
      .limit(limit)
      .skip(skip)
      .sort({ updatedAt: -1 });

    const exampleData = await query.exec(); // after all query generate then use await here

    return res.status(200).json({
      current_page: Number(page),
      per_page: Number(limit),
      total: Number(total),
      from: exampleData.length > 0 ? Number(skip + 1) : null,
      to: exampleData.length > 0 ? Number(skip + exampleData.length) : null,
      last_page: Number(pages),
      search: search,
      result: exampleData
    });
  } catch (err) {
    next(err);
  }
};

example.store = async (req, res, next) => {
  try {
    const data = { name: req.body.name };
    await Example.create(data);

    return res.json({ msg: "Example created successfully" });
  } catch (err) {
    next(err);
  }
};

example.show = async (req, res, next) => {
  try {
    const exam = await Example.findOne({ _id: req.params.id });

    return res.json({ example: exam });
  } catch (err) {
    next(err);
  }
};

example.update = async (req, res, next) => {
  try {
    const data = { name: req.body.name };
    await Example.update({ _id: req.params.id }, { $set: data });

    return res.json({ msg: "Example updated successfully" });
  } catch (err) {
    next(err);
  }
};

example.delete = async (req, res, next) => {
  try {
    const idsToDelete = req.params.id.split(",");
    await Example.deleteMany({ _id: { $in: idsToDelete } });
    return res.json({ msg: "Example deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = example;
