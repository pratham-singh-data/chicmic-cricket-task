const express = require("express");
const Joi = require("joi");
const { getPlayersData, editPlayersData } = require("../helper/fileDataManipulation");
const { ExistingPlayerRegistration, SuccessfulPlayerRegistration } = require("../util/messages");
const querystring = require("querystring")
const router = express.Router({
    caseSensitive: true,
})

const playerDataSchema = Joi.object({
    name: Joi.string().required(),
    team: Joi.string().required(),
    id: Joi.string(),
    type: Joi.string().valid("batsman", "baller", "all-rounder"),
})

router.post("/", (req, res) => {
    let body;

    try{
        body = Joi.attempt(req.body, playerDataSchema);
    }
    catch(err) {
        res.json({
            statusCode: 400,
            message: err.message
        })
        return;
    }

    const fileData = getPlayersData();
    
    if(fileData[body.id]) {
        res.json({
            statusCode: 403,
            message: ExistingPlayerRegistration,
        })
        return;
    }

    fileData[body.id] = body;
    body["no. of matches"] = 0;

    editPlayersData(fileData);

    res.json({
        statusCode: 200,
        message: SuccessfulPlayerRegistration,
    })
})

router.get("/", (req, res) => {
    console.log((req.url.slice(req.url.indexOf("/?") + 2)));
    res.send("Done");
})

module.exports = router;