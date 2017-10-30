import mongoose from 'mongoose';
import { dbConfig } from '../../config';
import { User } from './models/User';
import { Employee } from './models/Employee';
import { Project } from "./models/Project";

export const setUpConnection = () =>
    mongoose.connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`);

export const findByLogin = login => {
    return User.findOne({ login });
};

export const initializeDb = () =>
    findByLogin('admin')
        .then(user => !user
            ? new User({
                login: 'admin',
                firstName: 'admin',
                lastName: 'admin',
                password: 'admin',
                isAdmin: true
            }).save()
            : user
        );

export const getAllUsers = adminLogin =>
    User
        .find()
        .populate('employees')
        .then(users =>
            users.filter(user => {
                delete user.password;
                return user.login !== adminLogin;
            })
        );

export const createUser = data =>
    (new User(data)).save();

export const createEmployee = (data, login) =>
    (new Employee(data))
        .save()
        .then(employee => Promise.all([ findByLogin(login), employee ]))
        .then(([user, employee]) => {
            user.employees = [
                ...user.employees,
                employee._id
            ];

            return Promise.all([employee, user.save()])
        });

export const getAllEmployees = login =>
    findByLogin(login)
        .populate('employees')
        .then(user => user.employees);

export const getSkillsPositionsProjects = () => {
    return Promise.all([getAllSkillsAndPositionsFromEmployees(), getAllProjects()])
        .then(([ result , projects]) => {
            let preparedSkills = [], preparedPositions = [];
            const preparedProjects = projects.map(project => project.name);

            result.forEach(item => {
                preparedSkills = [...preparedSkills, ...item.skills];
                preparedPositions.push(item.position);
            });

            preparedSkills = preparedSkills.filter(uniqueFilter);
            preparedPositions = preparedPositions.filter(uniqueFilter);

            return [preparedSkills, preparedPositions, preparedProjects]
        });
};

const uniqueFilter = (item, index, arr) => arr.indexOf(item) === index;

const getAllSkillsAndPositionsFromEmployees = () =>
    Employee.find().select('skills position').exec();

export const getEmployeeById = id =>
    getSkillsPositionsProjects()
        .then(([skills, positions, projects]) =>
            Promise.all([Employee.findById(id), skills, positions, projects])
        );

export const updateEmployeeData = (id, data) =>
    Employee.findByIdAndUpdate(id, { $set: data });

export const deleteEmployee = id =>
    Employee.findByIdAndRemove(id);

export const createProject = data =>
    (new Project(data)).save();

export const updateProjectData = (id, data) =>
    Project.findByIdAndUpdate(id, { $set: data });

export const deleteProject = id =>
    Project.findByIdAndRemove(id);

export const getAllProjects = () =>
    Project.find();

export const getProjectById = id =>
    Project.findById(id);
