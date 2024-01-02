const fs = require('fs');
const server = require('http').createServer();

server.on('request', (request, response) => {   
    // Solution 1 - only work with small files and locally - not for production use
    // writing everything at once in a variable, one it is ready, send the entire piece to client
    // fs.readFile('test-file.txt', (err, data) => {
    //     if (err) console.log(err);
    //     response.end(data);
    // });

    // Solution 2 - streams
    // streaming the file, read one piece of the file, as soon as it's available, we send it to client, using write method
    // const readable = fs.createReadStream('test-file.txt');
    // readable.on('data', (chunk)=> {
    //     response.write(chunk);
    // });
    // readable.on('end', () => {
    //     // no need to pass in anything in the end() method, because all data have been sent chunk by chunk
    //     // this is only used as a signal that we're ready to use end() method
    //     response.end();
    // });
    // readable.on('error', (err) => {
    //     console.log(err);
    //     response.statusCode = 500;
    //     response.end("File not found")
    // });

    // Solution 3 - pipe operator, to deal with the backpressure issue
    const readable = fs.createReadStream('test-file.txt');
    readable.pipe(response)
    // readableSource.pipe(writeableDestination)
});

server.listen(8000, "127.0.0.1", () => {
    console.log("Listening...");
});