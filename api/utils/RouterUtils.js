var express = require('express');
// Gerekli modülleri import edin
const Response = require("../lib/Response");
const Enum = require("../config/Enum");
const CustomError = require("../lib/Error");

function deleteFunc(Model) {
    var router = express.Router();
    
    router.post("/delete", async (req, res) => {
        try {
            let body = req.body;
            if (!body._id)
                throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, Enum.RESPONSE_MESSAGES.BAD_REQUEST, "id field is required");

            await Model.deleteOne({ _id: body._id });
            res.json(Response.successResponse(Enum.RESPONSE_MESSAGES.DELETED));

        } catch (err) {
            res.json(Response.errorResponse(err, Enum.HTTP_CODES.BAD_REQUEST))
        }
    });
    
    return router; // Router'ı return et
}

module.exports = function (Model) {
    return {
        delete: deleteFunc(Model)
    }
};