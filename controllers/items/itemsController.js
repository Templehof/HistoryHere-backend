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
    await Item.create(req.body);
    res.status(201).json({
      status: "success",
      message: "item added!",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "error, invalid data :(",
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
    });
  } catch (error) {
    console.log(error)
    res.status(404).json({
      status: "fail",
      message: "error, couldn't remove the item :(",
    });
  }
};
