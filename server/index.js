import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import auth from 'basic-auth';

import { serverPort } from '../config.json';

// Initialization of express application
const app = express();

// Using bodyParser middleware
app.use( bodyParser.json() );

// Allow requests from any origin
app.use( cors({ origin: '*' }) );

// RESTful API
app.get('/', (req, res) => {

    res.send('works');
});

const server = app.listen(serverPort, function() {
    console.log(`Server is up and running on port ${serverPort}`);
});