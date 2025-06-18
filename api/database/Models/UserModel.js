const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const is = require("is_js");
const {HTTP_CODES} = require("../../config/Enum");
const CustomError = require("../../lib/Error");
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
    validPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }

    static validateFieldsBeforeAuth(email, password) {
        if (typeof password !== "string" || password.length < 7 || is.not.email(email))
            throw new CustomError(HTTP_CODES.UNAUTHORIZED, "Validation Error", "email or password wrong");

        return null;
    }
}

userSchema.loadClass(UserModel);
module.exports = mongoose.model("users", userSchema); // users models in mongodb with userSchema