/* eslint-disable no-console */
// const fs = require('fs');
const Tour = require('../models/tourModel');

// Read tours data from tours-simple.json
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// Check if the id exists
// const checkID = (req, res, next, val) => {
//   // eslint-disable-next-line no-console
//   console.log(`Tour id is: ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

// Create a checkBody middleware
// Check if body contains the name and price property
// If not, send back 400 bad request
// Add it to the post handler stack
// const checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: 'fail',
//       messsage: 'Missing required fields',
//     });
//   }
//   next();
// };

// Test controllers using data saved in local storage

// const getAllTours = (req, res) => {
//   res.status(200).json({
//     status: 'Success',
//     requestedAt: req.requestTime,
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// };

// const getTour = (req, res) => {
// Convert id from string to integer
// const id = req.params.id * 1;
// Use find() method to find the tour with id=id in the tours array
// const tour = tours.find((el) => el.id === id);
// res.status(200).json({
//   status: 'Success',
//   data: {
//     tour,
//   },
// });
//};

// const createTour = (req, res) => {
//   // define the id of the new tour
//   const newId = tours[tours.length - 1].id + 1;
//   // create the new tour
//   const newTour = { id: newId, ...req.body };
//   // add the new tour to the tours array
//   tours.push(newTour);
//   // write into the tours-simple.json file
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     // eslint-disable-next-line no-unused-vars
//     (err) => {
//       res.status(201).json({
//         status: 'Success',
//         data: {
//           tour: newTour,
//         },
//       });
//     },
//   );
// };

// Controllers interacting with real database

const getAllTours = async (req, res) => {
  try {
    console.log(req.query);
    // Build query
    // 1) Filtering
    // example url: http://localhost:8000/api/v1/tours?difficulty=easy&page=2&sort=1&limit=10
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // console.log(req.query, queryObj);

    // 2) Advanced filtering
    // example url: http://localhost:8000/api/v1/tours?duration[gte]=5&difficulty=easy&price[lt]=1500
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //console.log(JSON.parse(queryStr));

    // { difficulty: 'easy', duration: {$gte: 5} }
    // { duration: { gte: '5' }, difficulty: 'easy' }
    // gte, gt, lte, lt

    const query = Tour.find(JSON.parse(queryStr));

    // Execute query
    const tours = await query;

    // Other ways to filter data
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy',
    // });

    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    // Send response
    res.status(200).json({
      message: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

const createTour = async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save();
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      message: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(201).json({
      message: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

const deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      message: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  //checkID,
  //checkBody,
};
