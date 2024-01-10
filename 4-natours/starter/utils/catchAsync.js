// create catchAsync function to replace try catch blocks
// wrap all asynchronous functions in the catchAsync function
// catchAsync function return a new anonymous function, which is assigned to createTour
// the returned function will be called as soon as thw new tour is created using createTour
module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
