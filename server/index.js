import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import random from 'randomstring';
import mime from 'mime';
import auth from 'basic-auth';

import * as db from './db/db';
import { serverPort, apiPrefix } from '../config';

// Initialization of express application
const app = express();

db.setUpConnection();

// Using bodyParser middleware
app.use( bodyParser.json() );

// Allow requests from any origin
app.use( cors({ origin: '*' }) );

db.initializeDb();

// Set up multer for uploading images
let currentUploadedImageName = '';

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, './public/uploads');
    },

    filename(req, file, callback) {
        currentUploadedImageName = `${random.generate()}.${mime.extension(file.mimetype)}`;

        callback(null, currentUploadedImageName);
    }
});

const multerMiddleware = multer({ storage }).single('image');

// RESTful API
app.use(express.static('build'));

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

app.post('/employee/create', multerMiddleware, (req, res) => {

    let { body: userData } = req;

    userData.imageUrl = currentUploadedImageName ? `/uploads/${currentUploadedImageName}` : '';

    db.createEmployee(userData)
        .then(result => {
            currentUploadedImageName = '';
            res.send(result);
        })
        .catch(err => {
            currentUploadedImageName = '';
            res.status(400).send(err);
        });
});

app.get('/employee/create', (req, res) => {

    db.getSkillsAndPositions()
        .then(([skills, positions]) => {
            res.send({
                skills,
                positions
            })
        })
        .catch((err) => {
            res.status(400).send(err);
        })
});

app.get('/employee', (req, res) => {

    db.getEmployeeById(req.query._id)
        .then(([employee, skills, positions]) => {
            res.send({
                employee,
                skills,
                positions
            });
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

app.get('/employees', (req, res) => {

    db.getAllEmployees()
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

app.post('/employee/update', multerMiddleware, (req, res) => {

    let { body: userData } = req;

    userData.imageUrl = currentUploadedImageName
        ? `/uploads/${currentUploadedImageName}`
        : userData.image;

    db.updateEmployeeData(userData._id, userData)
        .then(result => {
            currentUploadedImageName = '';
            res.send(result);
        })
        .catch(err => {
            currentUploadedImageName = '';
            res.status(400).send(err);
        })
});

app.post('/employee/delete', (req, res) => {

    db.deleteEmployee(req.body.id)
       .then(result => {
           res.send(result);
       })
       .catch(err => {
           res.status(400).send(err);
       })
});

const server = app.listen(serverPort, function() {
    console.log(`Server is up and running on port ${serverPort}`);
});