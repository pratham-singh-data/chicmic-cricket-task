const Joi = require(`joi`);
const { getPlayersData,
    editPlayersData, } = require(`../helper/fileDataManipulation`);
const { SuccessfulPlayerRegistration,
    ReadNonExistentPlayer,
    UnableToAddData, } = require(`../util/messages`);
const querystring = require(`querystring`);
const uuid = require(`uuid`);
const { sendResponse, } = require(`../util/sendResponse`);
const { playerDataSchema, } = require(`../validators/playerDataSchema`);

/**
 * Add a player to the database
 * @param {Request} req express request object
 * @param {Response} res express response object]
 */
function addPlayer(req, res) {
    let body;

    try {
        body = Joi.attempt(req.body, playerDataSchema);
    } catch (err) {
        sendResponse(res, {
            statusCode: 400,
            message: err.message,
        });
        return;
    }

    // eslint-disable-next-line max-len
    const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;

    if (! regexp.test(body.imageURL)) {
        delete body.imageURL;
    }

    const playerFileData = getPlayersData();

    let uid = uuid.v4();
    let iter = 0;
    while (playerFileData[uid] && iter++ <= 10000) {
        uid = uuid.v4();
    }

    if (iter > 10000) {
        sendResponse(res, {
            statusCode: 500,
            message: UnableToAddData,
        });
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
    });
}

/**
 * Retuns data of one player to the client
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {next} next express next function
 */
function readPlayer(req, res, next) {
    const { id: idToDisplay, } = querystring.parse(
        req.url.slice(req.url.indexOf(`/?`) + 2),
        `&`,
        `=`
    );

    if (! idToDisplay) {
        next();
        return;
    }

    const playerFileData = getPlayersData();

    if (! playerFileData[idToDisplay]) {
        sendResponse(res, {
            statusCode: 403,
            message: ReadNonExistentPlayer,
        });
        return;
    }

    sendResponse(res, {
        statusCode: 200,
        data: playerFileData[idToDisplay],
    });
}

/**
 * Retuns data of all players to the client
 * @param {Request} req express request object
 */
function readAllPlayers(req) {
    const playerFileData = getPlayersData();

    sendResponse(req.res, {
        statusCode: 200,
        data: playerFileData,
    });
}

module.exports = {
    addPlayer,
    readPlayer,
    readAllPlayers,
};
