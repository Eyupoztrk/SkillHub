var express = require('express');
var router = express.Router();
const skillModel = require("../database/Models/SkillModel");
const Response = require("../lib/Response");
const Enum = require("../config/Enum");
const CustomError = require("../lib/Error");


/* listing. */
router.get("/", async (req, res) => {

    try {
        let skills = await skillModel.find({});
        res.json(Response.successResponse(skills, Enum.HTTP_CODES.ACCEPTED));
    }
    catch (err) {
        res.json(Response.errorResponse(err, Enum.HTTP_CODES.BAD_REQUEST))
    }

});


router.post("/add", async (req, res) => {
    let body = req.body

    try {
        if (!body.name)
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "name must be filled");

        let skills = new skillModel({
            name: body.name
        });

        await skills.save();
        res.json(Response.successResponse(Enum.RESPONSE_MESSAGES.CREATED));

    }
    catch (err) {

        res.json(Response.errorResponse(err, Enum.HTTP_CODES.BAD_REQUEST))
    }
});

router.post("/update", async (req, res) => {
    try {
        let body = req.body;

        if (!body._id)
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "Id must be filled");
        if (!body.name)
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "Name must be filled");

        let updates = {
            name: body.name
        };

        await skillModel.updateOne({ _id: body._id }, { $set: updates });
        res.json(Response.successResponse(Enum.RESPONSE_MESSAGES.UPDATED));


    }
    catch (err) {
        res.json(Response.errorResponse(err, Enum.HTTP_CODES.BAD_REQUEST))
    }
});

router.post("/delete", async (req, res) => {

  try {
    let body = req.body;

    if (!body._id)
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "id field is required"); // Hata fırlatır

    await skillModel.deleteOne({ _id: body._id });

    res.json(Response.successResponse(Enum.RESPONSE_MESSAGES.DELETED));
  } catch (err) {
    res.json(Response.errorResponse(err));
  }

});

module.exports = router;
