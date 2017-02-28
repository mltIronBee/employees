import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({

    login: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    employees: [{
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    }],

    isAdmin: {
        type: Boolean,
        default: false
    }
});

export const User = mongoose.model('User', UserSchema);