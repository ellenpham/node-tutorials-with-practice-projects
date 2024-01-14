const AppError = require('../utils/appError');

/* eslint-disable no-console */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// eslint-disable-next-line no-unused-vars
const handleJwtError = () =>
  new AppError('Invalid token. Please log in again', 401);

// eslint-disable-next-line no-unused-vars
const handleTokenExpiredError = () =>
  new AppError('Token has expired. Please log in again', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknow error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR: ', err);
    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    // change to Object.create(err) because the spread syntax does not copy all properties from the err object, only enumerable properties
    // message and stack are non-enumerable preoperties
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
      return sendErrorProd(error, res);
    }

    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(error);
      return sendErrorProd(error, res);
    }

    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
      return sendErrorProd(error, res);
    }

    if (err.name === 'JsonWebTokenError') {
      error = handleJwtError();
      return sendErrorProd(error, res);
    }

    if (err.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
      return sendErrorProd(error, res);
    }

    sendErrorProd(err, res);
  }
};
