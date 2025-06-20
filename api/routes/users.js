var express = require('express');
var router = express.Router();
const userModel = require("../database/Models/UserModel");
const skillModel = require("../database/Models/SkillModel");

const Response = require("../lib/Response");
const Enum = require("../config/Enum");
const CustomError = require("../lib/Error");
const is = require("is_js");
const bcrypt = require('bcrypt');
const JWT = require("jwt-simple");
const config = require('../config');
const auth = require("../lib/auth")();

const {rateLimit} = require("express-rate-limit");
const rateLimitMongo = require("rate-limit-mongo")

const limiter = rateLimit({
  store: new rateLimitMongo({
    uri: config.CONNECTION_STRING,
    collectionName: "rateLimits",
    expireTimeMs: 15 * 60 * 1000
  }),
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	//standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	
});


router.post("/register", async (req, res) => { // register for admin
  try {
    let body = req.body;
    let userExist = await userModel.findOne({}); // is there any user?

    if (userExist) // if exist return
      return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND);

    if (!body.email)
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "Email field is required");
    if (!is.email(body.email))
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "Email format is not valid");
    if (!body.password)
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "Password field is required");

    let passwordHash = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

    let user = await new userModel({
      username: body.username,
      email: body.email,
      password: passwordHash,
      bio: body.bio,
      skills: body.skills

    });

    await user.save();
    res.json(Response.successResponse(Enum.RESPONSE_MESSAGES.CREATED));

  } catch (err) {
    res.json(Response.errorResponse(err));
  }
});

router.post("/auth", limiter, async (req, res) => {
  try {
    let { email, password } = req.body;
    userModel.validateFieldsBeforeAuth(email, password);

    let user = await userModel.findOne({ email });
    if (!user)
      throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "validation", "Email or Password wrong");

    if (!user.validPassword(password))
      throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "validation", "Email or Password wrong");

    let payload = {
      id: user._id,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
    }

    let token = JWT.encode(payload, config.JWT.SECRET);

    let userData = {
      id: user._id,
      email: user.email
    }

    res.json(Response.successResponse({ token, user: userData }));

  } catch (err) {
    res.json(Response.errorResponse(err));
  }
});


router.all('*', auth.authenticate(), (req, res, next) => {
  next(); 
});

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
