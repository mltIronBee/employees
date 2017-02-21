import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import auth from 'basic-auth';

import * as db from './db/db';
import { serverPort } from '../config.json';

// Initialization of express application
const app = express();

db.setUpConnection();

// Using bodyParser middleware
app.use( bodyParser.json() );

// Allow requests from any origin
app.use( cors({ origin: '*' }) );

db.initializeDb();

// RESTful API

app.get('/login', (req, res) => {
    let { name, pass } = auth(req);

    db.findByLogin(name)
        .then(user => {
        if (user.password !== pass ) {
            res.status(401).end();
        } else {
            res.send(user);
        }
    })
        .catch(err => {
            res.status(404).end();
        });
});

app.post('/employees/create', (req, res) => {

    db.createEmployee(req.body)
        .then(result => {
            res.send(result);
            console.log(result);
        })
        .catch(err => {
            res.send(err);
        });
});

app.get('/employees', (req, res) => {

    db.getAllEmployees()
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            res.send(err);
        });
});

app.post('/employees/update', (req, res) => {

    db.updateEmployeeData(req.body._id, req.body)
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            res.send(err);
            console.log(err);
        })
});

app.post('/employees/delete', (req, res) => {

    db.deleteEmployee(req.body._id)
       .then(result => {
           res.send(result);
       })
       .catch(err => {
           res.send(err);
       })
});

const server = app.listen(serverPort, function() {
    console.log(`Server is up and running on port ${serverPort}`);
});