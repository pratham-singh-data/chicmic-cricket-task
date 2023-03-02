const Joi = require("joi");
const { getTeamsData, getGamesData, getConfigData, editConfigData, editGamesData, editTeamsData } = require("../helper/fileDataManipulation");

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

function scheduleGame(req, res) {
    
}

function addPlayers(req, res) {
    
}

module.exports = {
    scheduleGame,
    addPlayers,
}