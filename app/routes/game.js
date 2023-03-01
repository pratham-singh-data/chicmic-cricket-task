const express = require("express");
const Joi = require("joi");
const { getGamesData, getConfigData, editConfigData, editGamesData, getTeamsData, editTeamsData } = require("../helper/fileDataManipulation");
const { SuccessfulGameScheduling, InvalidTeamsBoth } = require("../util/messages");

const router = express.Router({
    caseSensitive: true,
})

const gameDataSchema = Joi.object({
    team1: Joi.string().required(),
    team2: Joi.string().required(),
    venue: Joi.string().required(),
    date: Joi.date().required(),
})

const addPlayersSchema = Joi.object({
    team1: Joi.array().items(Joi.string()).required(),
    team2: Joi.array().items(Joi.string()).required(),
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

router.patch("/:id", (req, res) => {
    const {id: idToUpdate} = req.params;

    let body;

    try {
        body = Joi.attempt(req.body, addPlayersSchema);
    }
    catch(err) {
        res.json({
            statusCode: 403,
            message: err.message,
        })
        return;
    }

    const teamsFileData = getTeamsData();
    const gamesFileData = getGamesData();

    const { team1: team1Players, team2: team2Players } = body;

    console.log(gamesFileData[idToUpdate], idToUpdate)
    const {team1: team1Name, team2: team2Name} = gamesFileData[idToUpdate];

    const invalidTeam1Members = team1Players.filter((inp) => ! teamsFileData[team1Name][inp]);
    const invalidTeam2Members = team2Players.filter((inp) => ! teamsFileData[team2Name][inp]);

    if(invalidTeam1Members.length || invalidTeam2Members.length) {
        res.json({
            statusCode: 403,
            message: `Invalid team members found:\nteam1:\t${invalidTeam1Members}\nteam2:${invalidTeam2Members}`,
        })
        return;
    }

    team1Players.forEach(inp => {
        gamesFileData[idToUpdate].team1Players[inp] = Date.now();
    });

    team2Players.forEach(inp => {
        gamesFileData[idToUpdate].team2Players[inp] = Date.now();
    });

    editGamesData(gamesFileData);
    editTeamsData(teamsFileData);

    res.json({
        statusCode: 200,
        message: "Successfully Added Players."
    })
})

module.exports = router;