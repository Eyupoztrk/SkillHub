const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    //role: String
    bio: String,
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'skills' }],
},
    {
        versionKey: false,
        timestamps: true
    }

);

class UserModel extends mongoose.Model {

}

userSchema.loadClass(UserModel);
module.exports = mongoose.model("users", userSchema); // users models in mongodb with userSchema