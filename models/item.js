const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  born: String,
  dead: String,
  year: String,
  buriedAt: String,
  description: String,
  link: {
    type: String,
    required: true,
  },
  image: String,
  coords:{
    type: [String],
    required: true,
  }
});

module.exports = mongoose.model("Item", itemSchema);