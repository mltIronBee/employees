import mongoose, { Schema } from 'mongoose';

const EmployeeSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },

    lastName: {
       type: String,
       required: true
    },

    position: {
        type: String,
        required: true
    },

    skills: {
       type: Array
    },

    startedAt: {
       type: Date
    },

    imageUrl: {
        type: String
    },

    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }],

    readyForTransition: {
        type: Boolean
    },

    projectsHistory: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }]
});

export const Employee = mongoose.model('Employee', EmployeeSchema);
