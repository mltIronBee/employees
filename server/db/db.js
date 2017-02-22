import mongoose from 'mongoose';

import { dbConfig } from '../../config.json';

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
                password: 'admin'
            });

            user.save();
        }
    })
};

export const createEmployee = (data) => {
    console.log(data);
    const employee = new Employee(data);

    return employee.save();
};

export const getAllEmployees = () => {
    return Employee.find();
};

export const getEmployeeById = (_id) => {
    return Employee.findById(_id);
};

export const updateEmployeeData = (_id, data) => {
    return Employee.findByIdAndUpdate(_id, { $set: data });
};

export const deleteEmployee = (_id) => {
    return Employee.findByIdAndRemove(_id);
};




