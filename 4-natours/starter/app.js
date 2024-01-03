const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARE

// HTTP request logger middleware for Node.js
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware to modify/process incoming request
app.use(express.json());

// Middleware to access to static files on browser
app.use(express.static(`${__dirname}/public`));

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

// Test route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from the server side!'});
});

// 2) ROUTES
// Mounting multiple routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;