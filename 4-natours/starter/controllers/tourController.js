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
    console.log(req.query); // { difficulty: 'easy', page: '2', sort: '1', limit: '10' }
    // BUILD QUERY
    // 1A) Filtering
    // example url: http://localhost:8000/api/v1/tours?difficulty=easy&page=2&sort=1&limit=10

    // create a shallow copy of req.query
    const queryObj = { ...req.query };
    // define the excluded fields for filtering just the difficulty level
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // loop over the excludedFileds array and delete each element of excludedFileds that exists in the queryObj
    excludedFields.forEach((el) => delete queryObj[el]);
    // console.log(queryObj); // { difficulty: 'easy' }

    // 1B) Advanced filtering
    // example url: http://localhost:8000/api/v1/tours?duration[gte]=5&difficulty=easy&price[lt]=1500
    let queryStr = JSON.stringify(queryObj);
    // console.log(queryObj); // { duration: { gte: '5' }, difficulty: 'easy', price: { lt: '1500' } }
    // console.log(queryStr); // {"duration":{"gte":"5"},"difficulty":"easy","price":{"lt":"1500"}}
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));
    // {
    //   duration: { '$gte': '5' },
    //   difficulty: 'easy',
    //   price: { '$lt': '1500' }
    // }

    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    // example url: http://localhost:8000/api/v1/tours?sort=price --> sort in ascending order
    // example url: http://localhost:8000/api/v1/tours?sort=-price --> sort in descending order
    // example url: http://localhost:8000/api/v1/tours?sort=-price,ratingsAvarage
    // or http://localhost:8000/api/v1/tours?sort=-price,-ratingsAverage
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      // console.log(req.query.sort); -price,-ratingsAverage
      // console.log(sortBy); // -price -ratingsAverage
      query = query.sort(sortBy);
    } else {
      query = query.sort('_id');
      // default sorting --> change from sort by createdAt to sort by id as it causes conflicts with pagination
    }

    // 3) Field limiting
    // example url: http://localhost:8000/api/v1/tours?fields=name,duration,difficulty,price
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4) Pagination
    // example url: http://localhost:8000/api/v1/tours?page=2&limit=3
    const page = req.query.page * 1 || 1; // to convert string to number
    const limit = req.query.limit * 1 || 100; // the number of results to be displayed in each page
    const skip = (page - 1) * limit;
    // page=2&limit=10, page 1: 1-10, page 2: 11-20, page 3: 21-30, etc.
    // when we need to jump to a particular page, it means we need to skip the previous pages
    // and it is calculated as the previous page times the number of results on each page "skip = (page - 1) * limit"
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    // EXECUTE QUERY
    const tours = await query;

    // SEND RESPONSE
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
