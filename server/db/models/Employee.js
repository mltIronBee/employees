import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({

    _leader: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
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
    }
});

export const Employee = mongoose.model('Employee', EmployeeSchema);