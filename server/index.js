import express from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import multer from 'multer';
import random from 'randomstring';
import mime from 'mime';
import auth from 'basic-auth';

import * as db from './db/db';
import { serverPort } from '../config';

const app = express();

db.setUpConnection();

app.use(bodyParser.json());
app.use(cors({ origin: '*' }));

db.initializeDb();

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

const requiredAuthMiddleware = (req, res, next) => {
    const authObj = auth(req);

    if (!authObj) return res.status(401).end();

    db.findByLogin(authObj.name)
        .then(user => {
            if (user.password !== authObj.pass) {
                res.status(401).end();
            } else {
                next();
            }
        })
        .catch(() => res.status(404).end());
};

const multerMiddleware = multer({ storage }).single('image');

const uniqueLoginMiddleware = (req, res, next) =>
    db.findByLogin(req.body.login)
        .then(user => !user
            ? next()
            : res.status(422).send('User already exists!')
        );

app.use(express.static('build'));

const apiRoutes = express.Router();

app.use('/api', apiRoutes);

app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'))
);

apiRoutes.get('/login', (req, res) => {
    const { name, pass } = auth(req);

    db.findByLogin(name)
        .then(user => {
            if (user.password !== pass ) {
                res.status(401).end();
            } else {
                res.send(user);
            }
        })
        .catch(() => res.status(404).end());
});

apiRoutes.get('/admin', requiredAuthMiddleware, (req, res) => {
    const { name: login } = auth(req);

    db.getAllUsers(login)
        .then(users => res.send(users))
        .catch(err => res.status(400).end(err));
});

apiRoutes.post('/register', uniqueLoginMiddleware, (req, res) => {
    db.createUser(req.body)
        .then(result => res.send(result))
        .catch(err => res.status(400).end(err));
});

apiRoutes.post('/employee/create', requiredAuthMiddleware, multerMiddleware, (req, res) => {
    const { body: employeeData } = req;
    const { name: login } = auth(req);

    employeeData.imageUrl = currentUploadedImageName ? `/uploads/${currentUploadedImageName}` : '';

    db.createEmployee(employeeData, login)
        .then(([ employee ]) => {
            currentUploadedImageName = '';
            res.send(employee);
        })
        .catch(err => {
            currentUploadedImageName = '';
            res.status(400).send(err);
        });
});

apiRoutes.get('/employee/create', requiredAuthMiddleware, (req, res) => {
    db.getSkillsPositionsProjects()
        .then(data => res.send(data))
        .catch(err => {
            console.log(err);
            res.status(400).send(err)
        })
});

apiRoutes.get('/employee', requiredAuthMiddleware, (req, res) => {
    db.getEmployeeById(req.query._id)
        .then(data => res.send(data))
        .catch(err => {
            res.status(400).send(err)
        });
});

apiRoutes.get('/employees', requiredAuthMiddleware, (req, res) => {
    const { name: login } = auth(req);

    db.getAllEmployees(login)
        .then(employees => res.send(employees))
        .catch(err => res.status(400).send(err));
});

apiRoutes.post('/employee/update',requiredAuthMiddleware, multerMiddleware, (req, res) => {
    const { body: userData } = req;

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

apiRoutes.post('/employee/delete', requiredAuthMiddleware, (req, res) => {
    db.deleteEmployee(req.body.id)
       .then(result => {
           res.send(result);
       })
       .catch(err => {
           res.status(400).send(err);
       })
});

apiRoutes.get('/projects', requiredAuthMiddleware, (req, res) => {
   db.getProjectsWithEmployees()
       .then(result => res.send(result))
       .catch(err => res.status(400).send(err))
});

apiRoutes.get('/project', requiredAuthMiddleware, (req, res) => {
    db.getProjectByIdWithEmployees(req.query._id)
        .then(result => res.send(result))
        .catch(err => res.status(400).send(err))
});

apiRoutes.post('/project/create', requiredAuthMiddleware, (req, res) => {
    db.createProject(req.body)
        .then(result => res.send(result))
        .catch(err => res.status(400).send(err))
});

apiRoutes.post('/project/update', requiredAuthMiddleware, (req, res) => {
    db.updateProjectData(req.body._id, req.body)
        .then(result => res.send(result))
        .catch(err => res.status(400).send(err))
});

apiRoutes.post('/project/delete', requiredAuthMiddleware, (req, res) => {
    db.deleteProject(req.body.id)
        .then(result => res.send(result))
        .catch(err => res.status(400).send(err))
});

app.listen(serverPort, () =>
    console.log(`Server is up and running on port ${serverPort}`)
);
