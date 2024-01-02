const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// 1) MIDDLEWARE

// HTTP request logger middleware for Node.js
app.use(morgan('dev'));

// Middleware to modify/process incoming request
app.use(express.json());

// Test custom middleware - the order of middleware matters
// A global middleware should be defined before all route handlers
app.use((req, res, next) => {
  console.log('Hello from the middleware!');
  // Must add next() to continue the resquest-response cycle
  next();
});

// Middleware to return when the exact time a request happens
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
})

// 2) ROUTE HANDLERS

// Test route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from the server side!'});
});

// Read tours data from tours-simple.json
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

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

  // Check if the tour exists
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: ' Invalid ID'
    });
  };

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
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: ' Invalid ID'
    });
  };

  res.status(200).json({
    status: "Success", 
    data: {
      tour: '<Update tour here...>'
    }
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: ' Invalid ID'
    });
  };

  res.status(204).json({
    status: "Success", 
    data: null
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  })
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  })
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  })
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  })
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  })
};

// ROUTE HANDLERS
// using v1 in the route to specify the API version
// in case there're changes in the API, it does not break the routes with the old API version

// Get all tours
// app.get('/api/v1/tours', getAllTours);

// Get one tour by ID
// app.get('/api/v1/tours/:id', getTour);

// Create a tour
// app.post('/api/v1/tours', createTour);

// Update a tour
// app.patch('/api/v1/tours/:id', updateTour);

// Delete a tour
// app.delete('/api/v1/tours/:id', deleteTour);

// 3) ROUTES
app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);


app
  .route('/api/v1/users')
  .get(getAllUsers)
  .post(createUser);

app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// 4) Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});