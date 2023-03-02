const { readFileSync, writeFileSync } = require("fs");

const PLAYERDATAURL = "./database/players.json";
const GAMESDATAURL = "./database/games.json";

function getPlayersData() {
    return JSON.parse(readFileSync(PLAYERDATAURL, {
        encoding: "utf-8",
    }))
}

function editPlayersData(data) {
    writeFileSync(PLAYERDATAURL, JSON.stringify(data));
}

function getGamesData() {
    return JSON.parse(readFileSync(GAMESDATAURL, {
        encoding: "utf-8",
    }))
}

function editGamesData(data) {
    writeFileSync(GAMESDATAURL, JSON.stringify(data));
}

module.exports = {
    getPlayersData,
    editPlayersData,
    getGamesData,
    editGamesData,
}