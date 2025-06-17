const mongoose = require("mongoose");

const skillSchema = mongoose.Schema (
    {
        name: String,
        ///
    },
    {
        versionKey: false, 
        timestamps : true, // createdAt and updatedAt 
    }
);

class SkillModel extends mongoose.Model
{

}

skillSchema.loadClass(SkillModel);
module.exports = mongoose.model("skills",skillSchema);