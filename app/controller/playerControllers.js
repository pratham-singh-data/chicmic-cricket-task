const Joi = require("joi");
const { getPlayersData, getTeamsData, editPlayersData, editTeamsData } = require("../helper/fileDataManipulation");
const { ExistingPlayerRegistration, SuccessfulPlayerRegistration, ReadNonExistentUser } = require("../util/messages");
const querystring = require("querystring");

const playerDataSchema = Joi.object({
    name: Joi.string().required(),
    team: Joi.string().required(),
    id: Joi.string().required(),
    type: Joi.string().valid("batsman", "baller", "all-rounder").required(),
})

function addPlayer(req, res) {
    
}

function readPlayer(req, res) {
    
}

module.exports = {
    addPlayer,
    readPlayer,
}