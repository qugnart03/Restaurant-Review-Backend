const ErrorResponse = require("../utils/errorResponse");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// CHECK IS USER IS AUTHENTICATED
exports.isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  // MAKE SURE TOKEN EXISTS
  console.log(req.cookies);
  if (!token) {
    console.log("No token");
    return next(new ErrorResponse("You must Log In...", 401));
  }

  try {
    // VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    console.log(error);
    return next(new ErrorResponse("You must Log In", 401));
  }
};

// MIDDLEWARE FOR ADMIN
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    console.log(req.user.role);
    return next(new ErrorResponse("Access denied, you must an admin", 401));
  }
  next();
};

// MIDDLEWARE FOR OWNRESTAURANT
exports.isOwnRestaurant = (req, res, next) => {
  if (req.user.role !== "ownrestaurant") {
    return next(
      new ErrorResponse("Access denied, you must own a restaurant", 401)
    );
  }
  next();
};

// Middleware cho quyền
exports.isRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`Access denied, your role must be ${roles}`, 401)
      );
    }
    next();
  };
};
