const fs = require('fs');

// Read tours data from tours-simple.json
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// Check if the id exists
const checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail', 
      message: 'Invalid ID'
    });
  }
  next();
};

// Create a checkBody middleware
// Check if body contains the name and price property
// If not, send back 400 bad request
// Add it to the post handler stack
const checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(404).json({
      status: 'fail',
      messsage: 'Missing required fields'
    });
  }
  next();
};

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'Success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  })
};

const getTour = (req, res) => {
  // Convert id from string to integer
  const id = req.params.id * 1;

  // Use find() method to find the tour with id=id in the tours array 
  const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: 'Success',
    data: {
      tour
    }
  })
};

const createTour = (req, res) => {
  // define the id of the new tour
  const newId = tours[tours.length-1].id + 1;
  // create the new tour
  const newTour = Object.assign({id: newId}, req.body);
  // add the new tour to the tours array
  tours.push(newTour);
  // write into the tours-simple.json file
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    res.status(201).json({
      status: 'Success',
      data: {
        tour: newTour
      }
    })
  });
};

const updateTour = (req, res) => {
  res.status(200).json({
    status: "Success", 
    data: {
      tour: '<Update tour here...>'
    }
  });
};

const deleteTour = (req, res) => {
  res.status(204).json({
    status: "Success", 
    data: null
  });
};

module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  checkID,
  checkBody
}