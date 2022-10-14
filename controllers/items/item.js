const Item = require("../../models/item");

exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json({
      status: "success",
      data: {
        items: items,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: "Error, could not fetch data",
    });
  }
};

exports.addItem = async (req, res) => {
  try {
    const newItem = await Item.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        item: newItem,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "error, invalid data :(",
    });
  }
};
