const express = require("express");
const Joi = require("joi");
const { getGamesData, getConfigData, editConfigData, editGamesData, getTeamsData } = require("../helper/fileDataManipulation");
const { SuccessfulGameScheduling, InvalidTeamsBoth } = require("../util/messages");
const { route } = require("./player");

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

    const teamsFileData = getTeamsData();
    const gamesFileData = getGamesData();
    const configFileData = getConfigData();

    if(! teamsFileData[body.team1] && teamsFileData[body.team2]) {
        res.json({
            statusCode: 403,
            message: `${body.team1} is not a registered team.`,
        })
        return;
    }

    if(! teamsFileData[body.team2] && teamsFileData[body.team1]) {
        res.json({
            statusCode: 403,
            message: `${body.team2} is not a registered team.`,
        })
        return;
    }

    if(! teamsFileData[body.team1] && !teamsFileData[body.team2]) {
        res.json({
            statusCode: 403,
            message: InvalidTeamsBoth,
        })
        return;
    }

    const gameId = configFileData.gamesId++;
    gamesFileData[gameId] = body;

    // initialise player data
    body.team2Players = body.team1Players = {}

    editConfigData(configFileData);
    editGamesData(gamesFileData);

    res.json({
        statusCode: 200,
        message: SuccessfulGameScheduling,
        gameId,
    })
})

// router.patch("/:id", (req, res) => {
//     const {id: idToUpdate} = req.params;

    
// })

module.exports = router;