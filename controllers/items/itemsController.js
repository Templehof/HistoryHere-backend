const { ObjectID } = require("bson");
const User = require("../../models/user");
const AppError = require("../../utils/appError");

exports.getAllItems = async (req, res) => {
  try {
    const user = await User.findById(req.body.id);

    if (!user) {
      return next(
        new AppError("A database error occured, please try again later")
      );
    }

    res.status(200).json({
      status: "success",
      data: user.savedItems,
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
    const user = await User.findById(req.body.id);
    const itemToSave = {...req.body.item, itemId: ObjectID()}
    user.savedItems = [...user.savedItems, itemToSave];
    await user.save();
    res.status(200).json({
      status: "success",
      message: "item saved successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "error, invalid data :(",
    });
  }
};