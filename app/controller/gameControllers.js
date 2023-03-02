const Joi = require("joi");
const { getGamesData, getPlayersData, editGamesData, editBallsData, getBallsData, editPlayersData } = require("../helper/fileDataManipulation");
const { sendResponse } = require("../util/sendResponse");
const uuid = require("uuid");
const { InvalidTeamMembers, SuccessfulGameScheduling, ReadNonExistentGame, DataSuccessfulUpdated, UnknownPlayerId, InvalidTeamPlacement, BallAlreadyRegistered, SuccessfulBallRegistration } = require("../util/messages");

const gameDataSchema = Joi.object({
    team1: Joi.string().required(),
    team2: Joi.string().required(),
    team1Players: Joi.array().items(Joi.string()).min(3).required(),
    team2Players: Joi.array().items(Joi.string()).min(3).required(),
    maxOvers: Joi.number().min(1),
    venue: Joi.string().required(),
    date: Joi.date().required(),
})

const addPlayersSchema = Joi.object({
    team1: Joi.array().items(Joi.string()).required(),
    team2: Joi.array().items(Joi.string()).required(),
})

const registerBallSchema = Joi.object({
    player_on_strike: Joi.string().required(),
    player_on_side: Joi.string().disallow(Joi.ref("player_on_strike")).required(),
    baller: Joi.string().disallow(Joi.ref("player_on_strike"), Joi.ref("player_on_side")).required(),
    ball: Joi.number().min(1).required(),
    over: Joi.number().min(1).required(),
    valid: Joi.string().valid("V", "W", "N").required(),
    runs: Joi.number().min(0).max(6).required(),
    playerOut: Joi.boolean().required(),
})

function scheduleGame(req, res) {
    let body;

    try {
        body = Joi.attempt(req.body, gameDataSchema);
    }
    catch(err) {
        sendResponse(res, {
            statusCode: 400,
            message: err.message,
        })
        return;
    } 

    const gameFileData = getGamesData();
    const playerFileData = getPlayersData();
    console.log(gameFileData)
    
    let gid = uuid.v4();
    let iter = 0
    while(gameFileData[gid] && iter++ <= 10000) {
        gid = uuid.v4();
    }

    // confirm that everyone is a valid player
    const invalidTeam1Players = body.team1Players.filter((inp) => ! playerFileData[inp] && body.team2Players.includes(inp));
    const invalidTeam2Players = body.team2Players.filter((inp) => ! playerFileData[inp] && body.team1Players.includes(inp));

    if(invalidTeam1Players.length || invalidTeam2Players.length) {
        sendResponse(res, {
            statusCode: 403,
            message: InvalidTeamMembers,
            invalidTeam1Players,
            invalidTeam2Players,
        })

        return;
    }

    body.balls = {};
    body.score = {};

    const team1Players = {};
    const team2Players = {};

    body.team1Players.forEach(inp => {
        playerFileData[inp].no_of_matches++;
        team1Players[inp] = Date.now();
    });

    body.team2Players.forEach(inp => {
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
    })
} 

function addPlayers(req, res) {
    let body;

    try {
        body = Joi.attempt(req.body, addPlayersSchema);
    }
    catch(err) {
        sendResponse(res, {
            statusCode: 400,
            message: err.message,
        })
        return;
    } 

    const {id: idToUpdate} = req.params;
    const gameFileData = getGamesData();
    const playerFileData = getPlayersData();

    const gameDataToUpdate = gameFileData[idToUpdate];
    // console.log(gameDataToUpdate)
    
    if(! gameDataToUpdate) {
        sendResponse(res, {
            statusCode: 400,
            message: ReadNonExistentGame,
        })
        return;
    }

    console.log(playerFileData["a52af7bc-6d78-4e12-bab5-84fab0ada954"])

    const validTeam1Players = body.team1.filter(inp => ! gameDataToUpdate.team2Players[inp] && ! gameDataToUpdate.team1Players[inp] && ! body.team2.includes(inp) && playerFileData[inp]);
    const validTeam2Players = body.team2.filter(inp => ! gameDataToUpdate.team1Players[inp] && ! gameDataToUpdate.team2Players[inp] && ! body.team1.includes(inp) && playerFileData[inp]);

    validTeam1Players.forEach(inp => {
        playerFileData[inp].no_of_matches++;
        gameDataToUpdate.team1Players[inp] = Date.now();
    })

    validTeam2Players.forEach(inp => {
        playerFileData[inp].no_of_matches++;
        gameDataToUpdate.team2Players[inp] = Date.now();
    })

    editGamesData(gameFileData);
    editPlayersData(playerFileData);

    sendResponse(res, {
        statusCode: 200,
        message: DataSuccessfulUpdated,
        data: gameDataToUpdate,
    })
}

function registerBall(req, res) {
    let body;

    try {
        body = Joi.attempt(req.body, registerBallSchema);
    }
    catch(err) {
        sendResponse(res, {
            statusCode: 400,
            message: err.message,
        })

        return;
    }

    const playerFileData = getPlayersData();
    const gameFileData = getGamesData();
    const ballFileData = getBallsData();

    // check if both players exist
    if(! playerFileData[body.player_on_strike] || ! playerFileData[body.player_on_side] || ! playerFileData[body.baller]) {
        sendResponse(res, {
            statusCode: 403,
            message: UnknownPlayerId,
        })

        return;
    }

    const {id: gameIdToUpdate} = req.params;

    // check if game exists
    if(! gameFileData[gameIdToUpdate]) {
        sendResponse(res, {
            statusCode: 403,
            message: ReadNonExistentGame,
        })

        return;
    }

    const gameData = gameFileData[gameIdToUpdate];

    // check if striker, swide and baller are actual players of the correct team
    if(! ((gameData.team1Players[body.player_on_strike] && gameData.team1Players[body.player_on_side] && gameData.team2Players[body.baller]) || (gameData.team2Players[body.player_on_strike] && gameData.team2Players[body.player_on_side] && gameData.team1Players[body.baller]))) {
        sendResponse(res, {
            statusCode: 400,
            message: InvalidTeamPlacement,
        })
        return;
    }

    // generate ballid
    let bid = uuid.v4();
    let iter = 0
    while(gameFileData[bid] && iter++ <= 10000) {
        bid = uuid.v4();
    }

    if(gameData.balls[body.over]) {
        if(gameData.balls[body.over][body.ball]){
            sendResponse(res, {
                statusCode: 403,
                message: BallAlreadyRegistered,
            })
            return;
        }
        else {
            gameData.balls[body.over][body.ball] = bid;
        }
    }
    else {
        gameData.balls[body.over] = {
            [body.ball]: bid,
        }
    }

    body.gid = gameIdToUpdate;
    ballFileData[bid] = body;

    // edit score
    gameData.score[body.over] = gameData.score[body.over] ? gameData.score[body.over] + body.runs : body.runs;

    // register wicket
    if(body.playerOut) { 
        playerFileData[body.baller].wickets++;
    }
    else {
        playerFileData[body.player_on_strike].runs += body.runs;
    }

    editBallsData(ballFileData);
    editGamesData(gameFileData);
    editPlayersData(playerFileData);

    sendResponse(res, {
        statusCode: 200,
        message: SuccessfulBallRegistration,
        data: body,
        gameData,
    })
}

module.exports = {
    scheduleGame,
    addPlayers,
    registerBall,
}