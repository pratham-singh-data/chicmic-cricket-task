const Joi = require("joi");
const { getGamesData, getPlayersData, editGamesData } = require("../helper/fileDataManipulation");
const { sendResponse } = require("../util/sendResponse");
const uuid = require("uuid");
const { InvalidTeamMembers, SuccessfulGameScheduling, ReadNonExistentGame } = require("../util/messages");

const gameDataSchema = Joi.object({
    team1: Joi.string().required(),
    team2: Joi.string().required(),
    team1Players: Joi.array().items(Joi.string()).min(3).required(),
    team2Players: Joi.array().items(Joi.string()).min(3).required(),
    venue: Joi.string().required(),
    date: Joi.date().required(),
})

const addPlayersSchema = Joi.object({
    team1: Joi.array().items(Joi.string()).required(),
    team2: Joi.array().items(Joi.string()).required(),
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

    body.balls = [];

    const team1Players = {};
    const team2Players = {};

    body.team1Players.forEach(inp => {
        team1Players[inp] = Date.now();
    });

    body.team2Players.forEach(inp => {
        team2Players[inp] = Date.now();
    });

    body.team1Players = team1Players;
    body.team2Players = team2Players;

    gameFileData[gid] = body;
    editGamesData(gameFileData);

    sendResponse(res, {
        statusCode: 200,
        message: SuccessfulGameScheduling,
        data: body,
        gid,
    })
} 

function addPlayers(req, res) {
    // let body;

    // try {
    //     body = Joi.attempt(req.body, addPlayersSchema);
    // }
    // catch(err) {
    //     sendResponse(res, {
    //         statusCode: 400,
    //         message: err.message,
    //     })
    //     return;
    // } 

    // const {id: idToUpdate} = req.params;
    // const gameFileData = getGamesData();
    // const playerFileData = getPlayersData();

    // const gameDataToUpdate = gameFileData[idToUpdate];
    // // console.log(gameDataToUpdate)
    
    // if(! gameDataToUpdate) {
    //     sendResponse(res, {
    //         statusCode: 400,
    //         message: ReadNonExistentGame,
    //     })
    //     return;
    // }

    // const validTeam1Players = body.team1.filter(inp => ! gameDataToUpdate.team2Players[inp] && ! body.team2.includes(inp) && ! playerFileData[inp]);
    // const validTeam2Players = body.team2.filter(inp => ! gameDataToUpdate.team1Players[inp] && ! body.team1.includes(inp) && ! playerFileData[inp]);

    // console.log(validTeam1Players)
    // console.log(validTeam2Players)
    

    // console.log(gameFileData);
    res.send("data")
}

function addBall() {

}

module.exports = {
    scheduleGame,
    addPlayers,
}