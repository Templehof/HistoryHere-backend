const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  link: {
    type: String,
    required: true,
  },
  imageUrl: String,
});

module.exports = mongoose.model("Item", itemSchema);
