const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');
const slugify = require('slugify')
const replaceTemplate = require('./modules/replaceTemplate');

// READING AND WRITING FILES 

// Blocking code execution - Synchronous
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn)

// const textOut = `This is what we know about the avocado: ${textIn}. \n Created on ${Date.now()}`;
// fs.writeFileSync('./txt/ouput.txt', textOut);
// console.log('File written')

// Non-blocking code execution - Asynchronous
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//     if (err) return console.log('ERROR!');

//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//             console.log(data3);

//             fs.writeFile('./txt/final.txt',`${data2}\n${data3}`, 'utf-8', (err) => {
//                 console.log('Your file has been written!')
//             });
//         });
//     });
// });
// console.log('Will read file!');


// SERVER

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');


const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map( item => slugify(item.productName, {lower: true}))

console.log(slugs);

const server = http.createServer( (request, response) => {

    // destructure query (eg: id=0) and pathname (eg: '/product') from URL 
    const {query, pathname} = url.parse(request.url, true);

    // Overview page
    if (pathname === '/' || pathname === '/overview') {
        response.writeHead(200, { 'Content-type' : 'text/html'});

        const cardsHtml = dataObj.map( item => replaceTemplate(tempCard, item)).join('');
        //console.log(cardsHtml);
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml)

        response.end(output);

    // Product page
    } else if (pathname === '/product') {
        // console.log(query) // it will print to the console everytime a link with corresponding id is clicked, 
        // eg [Object: null prototype] { id: '2' }

        response.writeHead(200, { 'Content-type' : 'text/html'});

        // dataObj is an array, we will retrieve the item with id from query
        // a simple way to retrieve an item based on a query string
        const product = dataObj[query.id];
        const output = replaceTemplate(tempProduct, product);
        response.end(output);
    
    // API
    } else if (pathname === '/api') {
        response.writeHead(200, { 'Content-type' : 'application/json'});
        response.end(data);
    
    // Not found
    } else {
        response.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-world'
        });
        response.end('<h1>Page not found!</h1>');
    }
});

server.listen(8000, '127.0.0.1', () => {
    console.log('Listening to requests on port 8000...')
});