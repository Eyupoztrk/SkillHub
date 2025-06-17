const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
    {
        from: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
        to: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
        comment: String,
        rating: Number
    },
    {
        versionKey: false,
        timestamps: true, // createdAt and updatedAt 
    }
);

class commentModel extends mongoose.Model{

}

commentSchema.loadClass(commentModel);
module.exports = mongoose.model("comments",commentSchema);

