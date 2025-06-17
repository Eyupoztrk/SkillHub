const mongoose = require("mongoose");

const applicationSchema = mongoose.Schema(
    {
        
        project: {type: mongoose.Schema.Types.ObjectId, ref: 'projects'},
        applicant: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
        coverLetter: String,
        proposedPrice: Number,
        status: String,
    },
    {
        versionKey: false,
        timestamps: true, // createdAt and updatedAt 
    }
);

class applicationModel extends mongoose.Model{

}

applicationSchema.loadClass(applicationModel);
module.exports = mongoose.model("applications",applicationSchema);

