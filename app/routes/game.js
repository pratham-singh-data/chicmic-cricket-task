const express = require("express");
const Joi = require("joi");
const { getGamesData, getConfigData, editConfigData, editGamesData } = require("../helper/fileDataManipulation");
const { SuccessfulGameScheduling } = require("../util/messages");

const router = express.Router({
    caseSensitive: true,
})

const gameDataSchema = Joi.object({
    team1: Joi.string().required(),
    team2: Joi.string().required(),
    venue: Joi.string().required(),
    date: Joi.date().required(),
})


router.post("/", (req, res) => {
    let body;

    try{
        body = Joi.attempt(req.body, gameDataSchema);
    }
    catch(err) {
        res.json({
            statusCode: 400,
            message: err.message
        })
        return;
    }

    const gamesFileData = getGamesData();
    const configFileData = getConfigData();

    gamesFileData[configFileData.gamesId++] = body;

    editConfigData(configFileData);
    editGamesData(gamesFileData);

    res.json({
        statusCode: 200,
        message: SuccessfulGameScheduling,
    })
})

module.exports = router;