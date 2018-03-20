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
    }
});

ProjectSchema.pre('remove', next => {
    return Promise.resolve()
        .then(() => Employee
            .update(
                { projects: this._id },
                { $pull: { projects: this._id } },
                { multi: true }
            )
            .exec()
        )
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
