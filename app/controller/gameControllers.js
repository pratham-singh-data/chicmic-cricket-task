const Joi = require(`joi`);
const { getGamesData,
    getPlayersData,
    editGamesData,
    editBallsData,
    getBallsData,
    editPlayersData, } = require(`../helper/fileDataManipulation`);
const { sendResponse, } = require(`../util/sendResponse`);
const uuid = require(`uuid`);
const { InvalidTeamMembers,
    SuccessfulGameScheduling,
    ReadNonExistentGame,
    DataSuccessfulUpdated,
    UnknownPlayerId,
    InvalidTeamPlacement,
    BallAlreadyRegistered,
    SuccessfulBallRegistration,
    ReadNonExistentBall,
    UnableToAddData,
    OverLimitReached, } = require(`../util/messages`);
const querystring = require(`querystring`);
const { gameDataSchema, } = require(`../validators/gameDataSchema`);
const { addPlayersSchema, } = require(`../validators/addPlayersSchema`);
const { registerBallSchema, } = require(`../validators/registerBallSchema`);
const { updateBallSchema, } = require(`../validators/updateBallSchema`);
const { tossRegisterSchema, } = require('../validators/tossRegisterSchema');

/**
 * Registers a game in the database.
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {next} next express next function
 */
function scheduleGame(req, res) {
    let body;

    try {
        body = Joi.attempt(req.body, gameDataSchema);
    } catch (err) {
        sendResponse(res, {
            statusCode: 400,
            message: err.message,
        });
        return;
    }

    const gameFileData = getGamesData();
    const playerFileData = getPlayersData();

    let gid = uuid.v4();
    let iter = 0;
    while (gameFileData[gid] && iter++ <= 10000) {
        gid = uuid.v4();
    }
    if (iter > 10000) {
        sendResponse(res, {
            statusCode: 500,
            message: UnableToAddData,
        });
        return;
    }

    // confirm that everyone is a valid player
    const invalidTeam1Players = body.team1Players.filter(
        (inp) => ! playerFileData[inp] &&
        body.team2Players.includes(inp));
    const invalidTeam2Players = body.team2Players.filter(
        (inp) => ! playerFileData[inp] &&
        body.team1Players.includes(inp));

    if (invalidTeam1Players.length || invalidTeam2Players.length) {
        sendResponse(res, {
            statusCode: 403,
            message: InvalidTeamMembers,
            invalidTeam1Players,
            invalidTeam2Players,
        });
        return;
    }

    body.balls = {};
    body.score = {};
    body.validBalls = {};

    const team1Players = {};
    const team2Players = {};

    body.team1Players.forEach((inp) => {
        playerFileData[inp].no_of_matches++;
        team1Players[inp] = Date.now();
    });

    body.team2Players.forEach((inp) => {
        playerFileData[inp].no_of_matches++;
        team2Players[inp] = Date.now();
    });

    body.team1Players = team1Players;
    body.team2Players = team2Players;

    gameFileData[gid] = body;
    editGamesData(gameFileData);
    editPlayersData(playerFileData);

    sendResponse(res, {
        statusCode: 200,
        message: SuccessfulGameScheduling,
        data: body,
        gid,
    });
}

/**
 * Add players to a registered game.
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {next} next express next function
 */
function addPlayers(req, res) {
    let body;

    try {
        body = Joi.attempt(req.body, addPlayersSchema);
    } catch (err) {
        sendResponse(res, {
            statusCode: 400,
            message: err.message,
        });
        return;
    }

    const { id: idToUpdate, } = req.params;
    const gameFileData = getGamesData();
    const playerFileData = getPlayersData();

    const gameDataToUpdate = gameFileData[idToUpdate];

    if (! gameDataToUpdate) {
        sendResponse(res, {
            statusCode: 400,
            message: ReadNonExistentGame,
        });
        return;
    }

    const validTeam1Players = body.team1.filter(
        (inp) => ! gameDataToUpdate.team2Players[inp] &&
        ! gameDataToUpdate.team1Players[inp] &&
        ! body.team2.includes(inp) &&
        playerFileData[inp]);
    const validTeam2Players = body.team2.filter(
        (inp) => ! gameDataToUpdate.team1Players[inp] &&
        ! gameDataToUpdate.team2Players[inp] &&
        ! body.team1.includes(inp) &&
        playerFileData[inp]);

    validTeam1Players.forEach((inp) => {
        playerFileData[inp].no_of_matches++;
        gameDataToUpdate.team1Players[inp] = Date.now();
    });

    validTeam2Players.forEach((inp) => {
        playerFileData[inp].no_of_matches++;
        gameDataToUpdate.team2Players[inp] = Date.now();
    });

    editGamesData(gameFileData);
    editPlayersData(playerFileData);

    sendResponse(res, {
        statusCode: 200,
        message: DataSuccessfulUpdated,
        data: gameDataToUpdate,
    });
}

/**
 * Registers a ball in an existing game in the database.
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {next} next express next function
 */
function registerBall(req, res) {
    let body;

    try {
        body = Joi.attempt(req.body, registerBallSchema);
    } catch (err) {
        sendResponse(res, {
            statusCode: 400,
            message: err.message,
        });
        return;
    }

    const playerFileData = getPlayersData();
    const gameFileData = getGamesData();
    const ballFileData = getBallsData();

    // check if both players exist
    if (! playerFileData[body.playerOnStrike] ||
        ! playerFileData[body.playerOnSide] ||
        ! playerFileData[body.bowler]) {
        sendResponse(res, {
            statusCode: 403,
            message: UnknownPlayerId,
        });
        return;
    }

    const { id: gameIdToUpdate, } = req.params;

    // check if game exists
    if (! gameFileData[gameIdToUpdate]) {
        sendResponse(res, {
            statusCode: 403,
            message: ReadNonExistentGame,
        });
        return;
    }

    const gameData = gameFileData[gameIdToUpdate];

    // check if striker, swide and bowler are actual players of the correct team
    if (! ((gameData.team1Players[body.playerOnStrike] &&
            gameData.team1Players[body.playerOnSide] &&
            gameData.team2Players[body.bowler]) ||
        (gameData.team2Players[body.playerOnStrike] &&
            gameData.team2Players[body.playerOnSide] &&
            gameData.team1Players[body.bowler]))) {
        sendResponse(res, {
            statusCode: 400,
            message: InvalidTeamPlacement,
        });
        return;
    }

    // do not proceed if there are six valid balls in given over
    if (gameData.validBalls[body.over] >= 6) {
        sendResponse(res, {
            statusCode: 403,
            message: OverLimitReached,
        });
        return;
    }

    // generate ballid
    let bid = uuid.v4();
    let iter = 0;
    while (gameFileData[bid] && iter++ <= 10000) {
        bid = uuid.v4();
    }

    if (iter > 10000) {
        sendResponse(res, {
            statusCode: 500,
            message: UnableToAddData,
        });
        return;
    }

    if (gameData.balls[body.over]) {
        if (gameData.balls[body.over][body.ball]) {
            sendResponse(res, {
                statusCode: 403,
                message: BallAlreadyRegistered,
            });
            return;
        } else {
            gameData.balls[body.over][body.ball] = bid;
        }
    } else {
        gameData.balls[body.over] = {
            [body.ball]: bid,
        };
    }

    body.gid = gameIdToUpdate;
    ballFileData[bid] = body;

    // edit score
    gameData.score[body.over] = gameData.score[body.over] ?
        gameData.score[body.over] + body.runs :
        body.runs;

    // register wicket
    if (body.playerOut) {
        playerFileData[body.bowler].wickets++;
    } else {
        playerFileData[body.playerOnStrike].runs += body.runs;
    }

    if (body.valid === `V`) {
        gameData.validBalls[body.over] = gameData.validBalls[body.over] ?
            ++gameData.validBalls[body.over] :
            1;
    }

    editBallsData(ballFileData);
    editGamesData(gameFileData);
    editPlayersData(playerFileData);

    sendResponse(res, {
        statusCode: 200,
        message: SuccessfulBallRegistration,
        data: body,
        gameData,
    });
}

/**
 * Remove data of one ball from the database.
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {next} next express next function
 */
function deleteBall(req, res) {
    const { id: idToDelete, } = req.params;

    const playerFileData = getPlayersData();
    const gameFileData = getGamesData();
    const ballFileData = getBallsData();

    if (! ballFileData[idToDelete]) {
        sendResponse(res, {
            statusCode: 403,
            message: ReadNonExistentBall,
        });
        return;
    }

    const ballToDelete = ballFileData[idToDelete];
    const relativeGame = gameFileData[ballToDelete.gid];
    const relativeBowler = playerFileData[ballToDelete.bowler];
    const relativeStriker = playerFileData[ballToDelete.playerOnStrike];

    // if player was out then remove their wicket
    if (ballToDelete.playerOut) {
        relativeBowler.wickets--;
    } else {
        relativeStriker.runs -= ballToDelete.runs;
    }

    // remove valid ball
    if (ballToDelete.valid === `V`) {
        relativeGame.validBalls[ballToDelete.over]--;
    }

    delete relativeGame.balls[ballToDelete.over][ballToDelete.ball];
    delete ballFileData[idToDelete];
    relativeGame.score[ballToDelete.over] -= ballToDelete.runs;

    editBallsData(ballFileData);
    editPlayersData(playerFileData);
    editGamesData(gameFileData);

    sendResponse(res, {
        statusCode: 200,
        message: DataSuccessfulUpdated,
    });
}

/**
 * Update data of a registered ball to data supplied by client.
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {next} next express next function
 */
function updateBall(req, res) {
    const { id: idToUpdate, } = req.params;

    const playerFileData = getPlayersData();
    const ballFileData = getBallsData();
    const gameFileData = getGamesData();

    if (! ballFileData[idToUpdate]) {
        sendResponse(res, {
            statusCode: 403,
            message: ReadNonExistentBall,
        });

        return;
    }

    const oldBallData = ballFileData[idToUpdate];
    const oldGameData = gameFileData[oldBallData.gid];

    let body;

    try {
        body = Joi.attempt(req.body, updateBallSchema);
    } catch (err) {
        sendResponse(res, {
            statusCode: 400,
            message: err.message,
        });
        return;
    }

    // check if both players exist
    if (! playerFileData[body.playerOnStrike] ||
        ! playerFileData[body.playerOnSide] ||
        ! playerFileData[body.bowler]) {
        sendResponse(res, {
            statusCode: 403,
            message: UnknownPlayerId,
        });
        return;
    }

    const { gid: gameIdToUpdate, } = body;

    // check if game exists
    if (! gameFileData[gameIdToUpdate]) {
        sendResponse(res, {
            statusCode: 403,
            message: ReadNonExistentGame,
        });
        return;
    }

    const newGameData = gameFileData[gameIdToUpdate];

    // check if striker, swide and bowler are actual players of the correct team
    if (! ((newGameData.team1Players[body.playerOnStrike] &&
                newGameData.team1Players[body.playerOnSide] &&
                newGameData.team2Players[body.bowler]) ||
            (newGameData.team2Players[body.playerOnStrike] &&
                newGameData.team2Players[body.playerOnSide] &&
                newGameData.team1Players[body.bowler]))) {
        sendResponse(res, {
            statusCode: 400,
            message: InvalidTeamPlacement,
        });
        return;
    }

    const { id: bid, } = req.params;

    delete oldGameData.balls[oldBallData.over][oldBallData.ball];

    if (newGameData.balls[body.over]) {
        if (newGameData.balls[body.over][body.ball]) {
            sendResponse(res, {
                statusCode: 403,
                message: BallAlreadyRegistered,
            });
            return;
        } else {
            newGameData.balls[body.over][body.ball] = bid;
        }
    } else {
        newGameData.balls[body.over] = {
            [body.ball]: bid,
        };
    }

    // edit score
    oldGameData.score[oldBallData.over] -= oldBallData.runs;

    newGameData.score[body.over] = newGameData.score[body.over] ?
        newGameData.score[body.over] + body.runs :
        body.runs;

    // // register wicket and runs
    if (oldBallData.playerOut) {
        playerFileData[oldBallData.bowler].wickets--;
    } else {
        playerFileData[oldBallData.playerOnStrike].runs -= oldBallData.runs;
    }

    if (body.playerOut) {
        playerFileData[body.bowler].wickets++;
    } else {
        playerFileData[body.playerOnStrike].runs += body.runs;
    }

    if (newGameData.validBalls[body.over] >= 6) {
        sendResponse(res, {
            statusCode: 403,
            message: OverLimitReached,
        });
        return;
    }

    if (oldBallData.valid === `V`) {
        oldGameData.validBalls[oldBallData.over]--;
    }

    if (body.valid === `V`) {
        newGameData.validBalls[body.over] = newGameData.validBalls[body.over] ?
            newGameData.validBalls[body.over] + 1 :
            1;
    }

    newGameData.balls[body.over][body.ball] = bid;

    ballFileData[bid] = body;

    editBallsData(ballFileData);
    editGamesData(gameFileData);
    editPlayersData(playerFileData);

    sendResponse(res, {
        statusCode: 200,
        message: DataSuccessfulUpdated,
    });
}

/**
 * Update toss info for a game
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {next} next express next function
 */
function setTossInformation(req, res, next) {
    let body;

    try {
        body = Joi.attempt(req.body, tossRegisterSchema);
    } catch (err) {
        sendResponse(res, {
            statusCode: 400,
            message: err.message,
        });
        return;
    }

    const { id: gameIdToUpdate, } = req.params;

    const gameFileData = getGamesData();

    const gameData = gameFileData[gameIdToUpdate];

    if (! gameData) {
        sendResponse(res, {
            statusCode: 403,
            message: ReadNonExistentGame,
        });
        return;
    }

    gameData.toss = body.toss;
    gameData.firstBatter = body.firstBatter;

    editGamesData(gameFileData);

    sendResponse(res, {
        statusCode: 200,
        message: DataSuccessfulUpdated,
        gameData,
    });
}

/**
 * Retuns data of one ball to the client
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {next} next express next function
 */
function getBall(req, res, next) {
    if (req.url.indexOf(`?id=`) === -1) {
        next();
        return;
    }

    const { id: idToDisplay, } = querystring.
        parse(req.url.slice(req.url.indexOf(`?id=`) + 1));

    const ballFileData = getBallsData();

    if (! ballFileData[idToDisplay]) {
        sendResponse(res, {
            statusCode: 403,
            message: ReadNonExistentBall,
        });

        return;
    }

    sendResponse(res, {
        statusCode: 200,
        data: ballFileData[idToDisplay],
    });
}

/**
 * Retuns data of all balls to the client
 * @param {Request} req express request object
 */
function getAllBalls(req) {
    const ballFileData = getBallsData();

    sendResponse(req.res, {
        statusCode: 200,
        data: ballFileData,
    });
}

/**
 * Return data of one game from the database.
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {next} next express next function
 */
function getGame(req, res, next) {
    const { id: idToDisplay, } = querystring.parse(
        req.url.slice(req.url.indexOf(`/?`) + 2),
        `&`,
        `=`);

    if (! idToDisplay) {
        next();
        return;
    }

    const gameFileData = getGamesData();

    if (! gameFileData[idToDisplay]) {
        res.sendResponse(res, {
            statusCode: 403,
            message: ReadNonExistentGame,
        });
        return;
    }

    sendResponse(res, {
        statusCode: 200,
        gameData: gameFileData[idToDisplay],
    });
}

/**
 * Retuns data of all games to the client
 * @param {Request} req express request object
 */
function getAllGames(req) {
    const gameFileData = getGamesData();

    sendResponse(req.res, {
        statusCode: 200,
        data: gameFileData,
    });
}

module.exports = {
    scheduleGame,
    addPlayers,
    registerBall,
    getBall,
    getAllBalls,
    getGame,
    getAllGames,
    deleteBall,
    updateBall,
    setTossInformation,
};
