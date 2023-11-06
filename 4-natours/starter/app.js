const fs = require('fs');
const express = require('express');

const app = express();

// Middleware to modify/process incoming request
app.use(express.json());


// Read the json file and parse into JS object
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// ROUTE HANDLERS
// using v1 in the route to specify the API version
// in case there're changes in the API, it does not break the routes with the old API version

const getAllTours = (request, response) => {
    response.status(200).json({
        status: 'successful',
        results: tours.length,
        data: {
            tours: tours
        }
    });
};


const getTour = (request, response) => {
    //console.log(request.params);

    const idFromParams = request.params.id * 1; // to convert string to number
    const tour = tours.find( el => el.id === idFromParams);

    // if (idFromParams > tours.length) or
    if(!tour) {
        return response.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    };
    
    response.status(200).json({
        status: 'successful',
        data: {
            tour: tour
        }
    });
};

const createTour = (request, response) => {
    //console.log(request.body);
    const newId = tours[tours.length-1].id + 1;
    const newTour = Object.assign({id: newId}, request.body);

    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        response.status(201).json({
            status: 'success',
            data : {
                tour: newTour
            }
        });
    });
};

const updateTour = (request, response) => {

    // if (idFromParams > tours.length) or
    if(request.params.id * 1 > tours.length) {
        return response.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    };
    response.status(200).json({
        status: 'success',
        data: {
            tour: '<Update tour here...>'
        }
    });
};

const deleteTour = (request, response) => {

    // if (idFromParams > tours.length) or
    if(request.params.id * 1 > tours.length) {
        return response.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    };
    response.status(204).json({
        status: 'success',
        data: null
    });
};


// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app
.route('/api/v1/tours')
.get(getAllTours)
.post(createTour);

app
.route('/api/v1/tours/:id')
.get(getTour)
.patch(updateTour)
.delete(deleteTour)

// Port set up
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`);
});