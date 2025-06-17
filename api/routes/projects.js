var express = require('express');
var router = express.Router();
const projectModel = require("../database/Models/ProjectModel");
const skillModel = require('../database/Models/SkillModel');
const applicationModel = require('../database/Models/ApplicationModel');
const userModel = require('../database/Models/UserModel');

const Response = require("../lib/Response");
const Enum = require("../config/Enum");
const CustomError = require("../lib/Error");


router.get("/", async (req, res) => {

    try {
        let projects = await projectModel.find({}).populate('skillsRequired', "name -_id");;
        res.json(Response.successResponse(projects, Enum.HTTP_CODES.ACCEPTED));
    }
    catch (err) {
        res.json(Response.errorResponse(err, Enum.HTTP_CODES.BAD_REQUEST))
    }

});

router.post("/add", async (req, res) => {
    try {
        let body = req.body;

        if (!body.title)
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "Title field is required"); // Hata fırlatır

        if (req.body.deadline && isNaN(Date.parse(req.body.deadline))) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "Invalid date format"); // Hata fırlatır
        }

        let project = new projectModel({
            title: body.title,
            description: body.description,
            budget: body.budget,
            deadline: body.deadline,
            createdBy: req.user?.id,
            skillsRequired: body.skillsRequired,
            applications: body.applications,
            status: body.status
        });

        await project.save();


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
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "Id field is required"); // Hata fırlatır
        if (body.deadline && !isNaN(Date.parse(req.body.deadline))) {
            updates.deadline = body.deadline;
        }

        updates.title = body.title;
        if (body.description) updates.description = body.description;
        if (body.budget) updates.budget = body.budget;
        if (body.status) updates.status = body.status;


        if (body.skillsRequired && Array.isArray(body.skillsRequired)) {
            
            let project = await projectModel.findById(body._id);
            let project_skillsRequired = project.skillsRequired

            let removedSkills = project_skillsRequired.filter(s => !body.skillsRequired.includes(s._id.toString()));
            let newSkills = body.skillsRequired.filter(s => !project_skillsRequired.includes(s));

            if (removedSkills.length > 0) {
                project_skillsRequired = project.skillsRequired.filter(skill => !removedSkills.some(removedId => removedId.equals(skill))
                );
            }

            if (newSkills.length > 0) {
                for (let i = 0; i < newSkills.length; i++) {
                    project_skillsRequired.push(newSkills[i]);
                }
            }

            updates.skillsRequired = project_skillsRequired;
        }

        await projectModel.updateOne({ _id: body._id }, { $set: updates });
        // aplications kısmı kaldı buradan devam et


        res.json(Response.successResponse(Enum.RESPONSE_MESSAGES.CREATED));
    }
    catch (err) {

        res.json(Response.errorResponse(err, Enum.HTTP_CODES.BAD_REQUEST))
    }
});

module.exports = router;