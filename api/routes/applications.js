var express = require('express');
var router = express.Router();
const applicationModel = require("../database/Models/ApplicationModel");
const Response = require("../lib/Response");
const Enum = require("../config/Enum");
const CustomError = require("../lib/Error");
const SkillModel = require('../database/Models/SkillModel');

router.get("/", async (req, res) => {

    try {
        let applications = await applicationModel.find({});
        res.json(Response.successResponse(applications, Enum.HTTP_CODES.ACCEPTED));
    }
    catch (err) {
        res.json(Response.errorResponse(err, Enum.HTTP_CODES.BAD_REQUEST))
    }

});

module.exports = router;