const fs = require('fs');
const crypto = require('crypto');

const start = Date.now()
process.env.UV_THREADPOOL_SIZE = 1

setTimeout( () => console.log("Timer 1 finished"), 0);
setImmediate( () => console.log("Immediate 1 finished"));

fs.readFile('test-file.txt', () => {
    console.log('I/O finished');
    console.log('-----------------')
    
    setTimeout( () => console.log("Timer 2 finished"), 0);

    // Timer 3 is the last one to execute in the event loop
    setTimeout( () => console.log("Timer 3 finished"), 3000);

    // Immediate 2 executes before Timer 2 because
    // the event loop waits for stuff to happen in the poll phase
    // if a callback using setImmediate is scheduled, it will be executed right away after the polling phase,
    // even before expired timers, if there is one
    // setImmediate executes once per tick. not immediately
    setImmediate( () => console.log("Immediate 2 finished"));

    // First one to execute in the event loop 
    // because nextTick is part of microtasks queue, which get executed after each phase, not just after one entire tick
    // a tick is an entire loop, but nextTick actually happends before the next loop phase
    process.nextTick( () => console.log('Process.nextTick'))

    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now() - start, 'Password encrypted')
    })

    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now() - start, 'Password encrypted')
    })
    
});

console.log("Hello from the top-level code")