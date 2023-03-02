const Joi = require("joi");
const { getPlayersData, getTeamsData, editPlayersData, editTeamsData } = require("../helper/fileDataManipulation");
const { ExistingPlayerRegistration, SuccessfulPlayerRegistration, ReadNonExistentUser } = require("../util/messages");
const querystring = require("querystring");
const uuid = require("uuid");

const playerDataSchema = Joi.object({
    name: Joi.string().required(),
    imageURL: Joi.string(),
    age: Joi.number().min(18).required(),
    type: Joi.string().valid("batsman", "baller", "all-rounder").required(),
})

function addPlayer(req, res) {
    let body;

    try {
        body = Joi.attempt(req.body, playerDataSchema);
    }
    catch(err) {
        res.json({
            statusCode: 400,
            message: err.message,
        })
    }

    let regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;

    if(! regexp.test(body.imageURL)) {
        delete body.imageURL;
    }

    const playerFileData = getPlayersData();
    console.log(playerFileData)
    
    let uid = uuid.v4();
    while(playerFileData[uid]) {
        uid = uuid.v4();
    }

    playerFileData[uid] = body;

    // generate data
    body.no_of_matches = body.wickets = body.runs = 0;

    editPlayersData(playerFileData);

    res.json({
        statusCode: 200,
        message: "Player Added Successfully",
        data: body,
        uid,
    })
}

function readPlayer(req, res) {
    
}

module.exports = {
    addPlayer,
    readPlayer,
}