const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please, tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide a valid email!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email!"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please, provide a password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please, confirm your passport"],
    minLength: 8,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords do not match!",
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  // Only run if password was modified
  if (!this.isModified("password")) return next();

  //Hashing the password
  this.password = await bcrypt.hash(this.password, 12);

  //no need to store it in the db
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  console.log(this.passwordChangedAt)
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(JWTTimestamp, changedTimestamp)
    return JWTTimestamp < changedTimestamp;
  } else {
    return false;
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
