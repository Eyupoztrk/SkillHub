var express = require('express');
var router = express.Router();
const applicationModel = require("../database/Models/ApplicationModel");
const SkillModel = require('../database/Models/SkillModel');

const Response = require("../lib/Response");
const Enum = require("../config/Enum");
const CustomError = require("../lib/Error");
const RouterUtils = require("../utils/RouterUtils");

const auth = require("../lib/auth")();

router.all('*', auth.authenticate(), (req, res, next) => {
  next(); 
});

router.get("/", async (req, res) => {

    try {
        let applications = await applicationModel.find({}).populate("project", "-_id ");
        res.json(Response.successResponse(applications, Enum.HTTP_CODES.ACCEPTED));
    }
    catch (err) {
        res.json(Response.errorResponse(err, Enum.HTTP_CODES.BAD_REQUEST))
    }

});

router.post("/add", async (req, res) => {
    try {
        let body = req.body;

        if (!body.project)
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "Project field is required");


        let applicant = new applicationModel({
            project: body.project,
            applicant: req.user?.id,
            coverLetter: body.coverLetter,
            proposedPrice: body.proposedPrice,
            status: body.status
        });

        await applicant.save();
        res.json(Response.successResponse(Enum.RESPONSE_MESSAGES.CREATED));

    }
    catch (err) {
        res.json(Response.errorResponse(err, Enum.HTTP_CODES.BAD_REQUEST))

    }

});

router.post("/update", async (req, res) => {
    try {
        let body = req.body;
        let updates = {};

        if (!body._id)
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "Id field is required");
        if (typeof body.proposedPrice !== "number")
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "proposedPrice field must be number");

        if (body.coverLetter) updates.coverLetter = body.coverLetter;
        if (body.proposedPrice) updates.proposedPrice = body.proposedPrice;
        if (body.String) updates.String = body.String;

        await applicationModel.updateOne({_id: body._id}, {$set: updates});

        res.json(Response.successResponse(Enum.RESPONSE_MESSAGES.CREATED));

    } catch (err) {
        res.json(Response.errorResponse(err, Enum.HTTP_CODES.BAD_REQUEST))
    }
});

router.post("/delete", async (req, res) => {
    try {
        let body = req.body;
        if (!body._id)
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "id field is required");

        await applicationModel.deleteOne({ _id: body._id });
        res.json(Response.successResponse(Enum.RESPONSE_MESSAGES.DELETED));


    } catch (err) {
        res.json(Response.errorResponse(err, Enum.HTTP_CODES.BAD_REQUEST))
    }
});

/*const userDeleteRoutes = RouterUtils(applicationModel);
router.use("/", userDeleteRoutes.delete);*/


module.exports = router;