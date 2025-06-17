const mongoose = require("mongoose");

const reportSchema = mongoose.Schema(
    {
        reportedUser: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
        reportedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
        reason: String,
        isReviewed: Boolean
    },
    {
        versionKey: false,
        timestamps: true, // createdAt and updatedAt 
    }
);

class reportModel extends mongoose.Model{

}

reportSchema.loadClass(reportModel);
module.exports = mongoose.model("reports",reportSchema);

