import mongoose from 'mongoose';

import { dbConfig } from '../../config';

import { User } from './models/User';
import { Employee } from './models/Employee';

export const setUpConnection = () => {
  mongoose.connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`);
};

export const findByLogin = (login) => {
    return User.findOne({ login });
};

export const initializeDb = () => {
    findByLogin('admin').then(user => {

        if(!user) {
            const user = new User({
                login: 'admin',
                firstName: 'admin',
                lastName: 'admin',
                password: 'admin',
                isAdmin: true
            });

            user.save();
        }
    })
};

export const getAllUsers = (adminLogin) => {
    return User
        .find()
        .populate('employees')
        .then(users => {
            //Todo: reduce password from user object to not have it on client
            return users.filter(user => user.login !== adminLogin);
        });
};

export const createUser = (data) => {
    return new User(data).save();
};

export const createEmployee = (data, login) => {
    return new Employee(data).save()
        .then(employee => {
            return Promise.all([findByLogin(login), employee]);
        })
        .then(([user, employee]) => {
            user.employees = [
                ...user.employees,
                employee._id
            ];

            return Promise.all([employee, user.save()])
        });
};

export const getAllEmployees = (login) => {
    return findByLogin(login)
        .populate('employees')
        .then(user => {
            return user.employees
        })
};

export const getSkillsAndPositions = () => {
    return Employee.find()
        .select('skills position')
        .exec()
        .then(result => {
            let preparedSkills = [],
                preparedPositions = [];

            const uniqueFilter = (item, index, self) => self.indexOf(item) === index;

            result.forEach(item => {
                preparedSkills = [...preparedSkills, ...item.skills];
                preparedPositions.push(item.position)
            });

            preparedSkills = preparedSkills.filter(uniqueFilter);
            preparedPositions = preparedPositions.filter(uniqueFilter);

            return [preparedSkills, preparedPositions];
        });
};

export const getEmployeeById = (_id) => {
    return getSkillsAndPositions()
        .then(([skills, positions]) => {
            const employeePromise = Employee.findById(_id);

            return Promise.all([employeePromise, skills, positions]);
        });
};

export const updateEmployeeData = (_id, data) => {
    return Employee.findByIdAndUpdate(_id, { $set: data });
};

export const deleteEmployee = (_id) => {
    return Employee.findByIdAndRemove(_id);
};