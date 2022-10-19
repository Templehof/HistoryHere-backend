const { promisify } = require("util");
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
      next(new AppError("Need to provide credentials"), 401);
    }

    //Check if user exists and the password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      next(new AppError("Incorrect credentials"), 401);
    }

    //If everything is ok send the token to the client
    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    res.status(401).json({
      status: "fail",
      data: {
        error: "An error occured :(",
      },
    });
  }
};

exports.protect = async (req, res, next) => {
  //get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    console.log("token identified")
    token = req.headers.authorization.split(" ")[1];
  }

  //verification of the token

  if (!token) {
    next(new AppError("Need to login to perform this action"), 401);
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log("decoded");
  //check if user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    next(new AppError("the user does no longer exist"), 401);
  }

  //check if user chainged password after jwt issuance
  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("password changed, login again"), 401);
  }

  //grant access
  req.user = currentUser;
  next();
};
