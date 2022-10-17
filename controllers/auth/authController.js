const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const AppError = require("../../utils/appError");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      data: {
        error: error,
      },
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //Check if email and password exist
    if (!email || !password) {
      return next(new AppError("Please, provide email and password!"), 400);
    }

    //Check if user exists and the password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect credentials"), 401);
    }

    //If everything is ok send the token to the client
    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      data: {
        error: error,
      },
    });
  }
};
