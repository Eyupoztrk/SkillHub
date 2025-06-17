var express = require('express');
var router = express.Router();
const userModel = require("../database/Models/UserModel");
const skillModel = require("../database/Models/SkillModel");

const Response = require("../lib/Response");
const Enum = require("../config/Enum");
const CustomError = require("../lib/Error");
const is = require("is_js");
const bcrypt = require('bcrypt');


/* GET users listing. */
router.get("/", async (req, res) => {

  try {
    let users = await userModel.find({}).populate('skills', 'name');

    res.json(Response.successResponse(users, Enum.HTTP_CODES.ACCEPTED));
  }
  catch (err) {
    res.json(Response.errorResponse(err, Enum.HTTP_CODES.BAD_REQUEST))
  }

});


router.post("/add", async (req, res) => {

  try {
    let body = req.body;


    if (!body.username || !body.email)
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "username or email cannot empty");

    if (is.not.email(body.email))
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "Email format is not valid"); // Hata fırlatır

    if (!body.skills || body.skills.length == 0)
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "Skills field is required"); // Hata fırlatır

    let skills = await skillModel.find({ _id: { $in: body.skills } }); // if bodys skills doesnt located in the skills model

    if (skills.length == 0) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "Skills field is required"); // Hata fırlatır
    }


    let passwordHash = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

    let user = await new userModel({
      username: body.username,
      email: body.email,
      password: passwordHash,
      bio: body.bio,
      skills: body.skills

    });

    await user.save()
    res.json(Response.successResponse(Enum.RESPONSE_MESSAGES.CREATED));


  }
  catch (err) {
    res.json(Response.errorResponse(err, Enum.HTTP_CODES.BAD_REQUEST))
  }

});


router.post('/update', async (req, res) => {
  try {
    let body = req.body;
    let updates = {};

    if (!body._id)
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "id field is required");

    if (body.password)
      updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

    if (body.username) updates.username = body.username;
    if (body.email) updates.email = body.email;
    if (body.bio) updates.bio = body.bio;


    if (Array.isArray(body.skills) && body.skills.length != 0) {
      let user = await userModel.findById(body._id);
      let userSkills = user.skills

      let removedSkills = userSkills.filter(s => !body.skills.includes(s._id.toString()));
      let newSkills = body.skills.filter(s => !userSkills.includes(s));

      if (removedSkills.length > 0) {
        // User'ın skills dizisinden çıkar
        userSkills = user.skills.filter(skill => !removedSkills.some(removedId => removedId.equals(skill))
        );
      }

      if (newSkills.length > 0) {
        for (let i = 0; i < newSkills.length; i++) {
          userSkills.push(newSkills[i]);
        }
      }

      updates.skills = userSkills;
    }

    await userModel.updateOne({ _id: body._id }, { $set: updates });

    res.json(Response.successResponse(Enum.RESPONSE_MESSAGES.UPDATED));



  }
  catch (err) {
    res.json(Response.errorResponse(err)); // Hata durumunda hata mesajını döner

  }

});

router.post("/delete", async (req, res) => {

  try {
    let body = req.body;

    if (!body._id)
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "id field is required"); // Hata fırlatır

    await userModel.deleteOne({ _id: body._id });

    res.json(Response.successResponse(Enum.RESPONSE_MESSAGES.DELETED));
  } catch (err) {
    res.json(Response.errorResponse(err));
  }

});

module.exports = router;
