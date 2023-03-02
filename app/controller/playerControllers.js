const Joi = require("joi");
const { getPlayersData, editPlayersData } = require("../helper/fileDataManipulation");
const { SuccessfulPlayerRegistration, ReadNonExistentPlayer } = require("../util/messages");
const querystring = require("querystring");
const uuid = require("uuid");
const { sendResponse } = require("../util/sendResponse");

const playerDataSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    imageURL: Joi.string(),
    age: Joi.number().min(18).required(),
    type: Joi.string().valid("batsman", "baller", "all-rounder").required(),
    jerseyNo: Joi.number().required(),
})

function addPlayer(req, res) {
    let body;

    try {
        body = Joi.attempt(req.body, playerDataSchema);
    }
    catch(err) {
        sendResponse(res, {
            statusCode: 400,
            message: err.message,
        })
        return;
    }

    let regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;

    if(! regexp.test(body.imageURL)) {
        delete body.imageURL;
    }

    const playerFileData = getPlayersData();
    console.log(playerFileData)
    
    let uid = uuid.v4();
    let iter = 0
    while(playerFileData[uid] && iter++ <= 10000) {
        uid = uuid.v4();
    }

    if(iter > 10000) {
        sendResponse(res, {
            statusCode: 500,
            message: "Unable to add data.",
        })
        return;
    }

    playerFileData[uid] = body;

    // generate data
    body.no_of_matches = body.wickets = body.runs = 0;

    editPlayersData(playerFileData);

    sendResponse(res, {
        statusCode: 200,
        message: SuccessfulPlayerRegistration,
        data: body,
        uid,
    })
}

function readPlayer(req, res, next) {
    const {id: idToDisplay} = querystring.parse(req.url.slice(req.url.indexOf("/?") + 2), "&", "=");
    
    if(! idToDisplay) {
        next();
        return;
    }

    const playerFileData = getPlayersData();

    if(! playerFileData[idToDisplay]) {
        sendResponse(res, {
            statusCode: 403,
            message: ReadNonExistentPlayer,
        })
        return;
    }

    sendResponse(res, {
        statusCode: 200,
        data: playerFileData[idToDisplay],
    })
}

function readAllPlayers(req) {
    const playerFileData = getPlayersData();

    sendResponse(req.res, {
        statusCode: 200,
        data: playerFileData,
    })
}

module.exports = {
    addPlayer,
    readPlayer,
    readAllPlayers,
}