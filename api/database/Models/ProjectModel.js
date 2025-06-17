const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
    {
        title: {type: String, required: true},
        description: String,
        budget: String,
        deadline: mongoose.Schema.Types.Date,
        createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
        skillsRequired: [{type: mongoose.Schema.Types.ObjectId,  ref: 'skills'}],
        applications: [{type: mongoose.Schema.Types.ObjectId,  ref: 'applications'}],
        status: String

    },
    {
        versionKey: false,
        timestamps: true, // createdAt and updatedAt 
    }
);

class projectModel extends mongoose.Model {

}

projectSchema.loadClass(projectModel);
module.exports = mongoose.model("projects", projectSchema);
