const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === "CastError") {
    const message = `Ressource not found ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // MONGOOSE DUPLICATE VALUE
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // MONGOOSE VALIDATION ERROR
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => " " + val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.codeStatus || 500).json({
    success: false,
    error: error.message || "SERVER ERROR",
  });
};

module.exports = errorHandler;
