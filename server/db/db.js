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
        .exec()
        .then(users =>
            Promise.all([
                users,
                Promise.all(
                    users.map(user =>
                        Employee.populate(user.employees, { path: 'projects', model: 'Project' }))
                )
            ])
        )
        .then(([ users, userEmployees ]) => {
            //Added list=, so delete user.password will actually work
            //instead of exposing password
            const list = users.map((user, index) => 
                Object.assign({}, user.toObject(), { employees: userEmployees[index] }));

            return list.filter(user => {
                delete user.password;
                return user.login !== adminLogin;
            });
        });

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

export const getAllEmployees = login => {
    return findByLogin(login)
        .populate('employees')
        .exec()
        .then(user => Employee.populate(user.employees, { path: 'projects', model: 'Project' }))
};

export const getSkillsPositionsProjects = () => {
    return Promise.all([getAllSkillsAndPositionsFromEmployees(), getAllProjects()])
        .then(([ skillsAndPositions, projects ]) => {
            const reduced = skillsAndPositions
                .reduce((acc, { skills, position }) => {
                    acc.skills = [...acc.skills, ...skills];
                    if (!acc.positions.includes(position))
                        acc.positions.push(position);

                    return acc;
                }, { skills: [], positions: [] });

            return Object.assign(reduced, {
                projects,
                skills: reduced.skills.filter(
                    (x, idx, arr) => arr.indexOf(x) === idx
                )
            });
        });
};

const getAllSkillsAndPositionsFromEmployees = () =>
    Employee.find().select('skills position').exec();

export const getEmployeeById = id =>
    getSkillsPositionsProjects()
        .then(data =>
            Promise.all([Employee.findById(id).populate('projects projectsHistory'), data])
        )
        .then(([ employee, data ]) =>
            Object.assign({}, data, { employee })
        );

export const updateEmployeeData = (id, data) =>
    Employee.findByIdAndUpdate(id, {
        $set: {
            firstName: data.firstName,
            lastName: data.lastName,
            position: data.position,
            startedAt: data.startedAt,
            readyForTransition: data.readyForTransition,
            image: data.image,
            skills: data.skills || [],
            projects: data.projects || [],
            projectsHistory: data.projectsHistory || [],
            available: data.available
        }
    });

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

export const getProjectsWithEmployees = () =>
    Project.find()
        .populate('managers', '_id firstName lastName')
        .lean()
        .exec()
        .then(projects => {
            const projectsEmployeesQuery = [];
            projects.forEach(project => {
                const employees = Employee.find({ projects: project._id }).exec();
                projectsEmployeesQuery.push(Promise.all([project, employees]))
            });

            return Promise.all(projectsEmployeesQuery);
        })
        .then(result => {
            const projectsWithEmployees = [];
            result.forEach(([ project, employees ]) => {
                project.employees = employees;
                projectsWithEmployees.push(project);
            });

            return projectsWithEmployees
        })
        .catch(console.log);

export const getEmployeesForProject = projectId =>
    Employee.find( { projects: { $nin: [ projectId ] } } ).exec();

export const getManagersForProject = (project, adminLogin) => {
    return User
        .find()
        .lean()
        .exec()
        .then(users => {
            const list = project && project.managers
            ? users.filter(user => {
                delete user.password;
                return user.login !== adminLogin &&
                !project.managers.map( pm => pm.login ).includes(user.login);
            })
            : users.filter( user => {
                delete user.password;
                return user.login !== adminLogin
            })

            return list;
        });
}

export const getProjectById = id =>
    Project.findById(id)
        .populate('managers', '_id login firstName lastName')
        .lean()
        .exec()
        .then(project => {
            const employees = Employee.find({ projects:  project._id}).exec();
            return Promise.all([ project, employees ])
        })
        .then(([ project, employees ]) => {
            project.employees = employees;
            return project
        })
        .catch(console.log);

export const getProjectByIdWithEmployees = (projectId, adminLogin) =>
    Promise.all([getProjectById(projectId), getEmployeesForProject(projectId)])
        .then(([ project, allEmployees ]) => 
            Promise.all( [project, allEmployees, getManagersForProject(project, adminLogin)] ))
        .then(([ project, allEmployees, allManagers ]) => ({ project, allEmployees, allManagers }));

export const getAllEmployeesForProject = () =>
    Employee.find().lean().exec();

