const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const AppError = require("../../utils/appError");
const sendEmail = require("../../utils/email");
const crypto = require("crypto");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    createSendToken(newUser, 201, res);
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
      return next(new AppError("Incorrect credentials"), 401);
    }

    //If everything is ok send the token to the client
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(401).json({
      status: "fail",
      data: {
        error: "An error occured :(",
      },
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    // Find user based on POST email
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("No user with this email"), 404);
    }

    //generate random password reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //Send it ti user's email
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit your new password and passwordConfirm to ${resetUrl} \n if you did not forget your password, ignore this email`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 minutes)",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email",
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError("error sending email try again later"), 500);
    }
  } catch (error) {
    res.status(401).json({
      status: "fail",
      data: {
        error: "An error occured :( in the bigger function",
      },
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  //Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //Set the new password if token is valid(not expired)
  if (!user) {
    return next(new AppError("Token expire"), 400);
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //update the changed password for the current user !(done in user model)

  //log the user in (send the jwt)
  createSendToken(user, 200, res);
};

exports.protect = async (req, res, next) => {
  //get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  //verification of the token

  if (!token) {
    next(new AppError("Need to login to perform this action"), 401);
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
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

exports.updatePassword = async (req, res, next) => {
  try {
    //get user from collection
    const user = await User.findById(req.user.id).select("+password");
    //Check if the posted password is correct

    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      next(new AppError("Incorrect credentials"), 401);
    }

    //if so update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //login user with new password(send jwt)
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(401).json({
      status: "fail",
      data: {
        error: "An error occured while trying to change password",
      },
    });
  }
};
