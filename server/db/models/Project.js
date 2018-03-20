import mongoose, { Schema } from 'mongoose';
import { Employee } from "./Employee";

const ProjectSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    managers: [{
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    }],

    startDate: {
        type: Date
    },

    finishDate: {
        type: Date
    }
});

const removeProjectFromEmployee = id => {
    return Promise.resolve()
        .then( () => Employee
            .update(
                    { projects: id },
                    { $pull: { projects: id } },
                    { multi: true }
                )
            .exec()
        )
};

ProjectSchema.pre('findOneAndUpdate', function (next) {
    if( this._update.$set.finishDate ) {
        return removeProjectFromEmployee(this._update.$set._id)
            .then( () => next());
    }

    next();
});

ProjectSchema.pre('remove', next => {
    return removeProjectFromEmployee(this._id)
        .then(() => Employee
            .update(
                { projectsHistory: this._id },
                { $pull: { projectsHistory: this._id } },
                { multi: true }
            )
            .exec()
        )
        .then(() => next())
});

export const Project = mongoose.model('Project', ProjectSchema, 'projects');
