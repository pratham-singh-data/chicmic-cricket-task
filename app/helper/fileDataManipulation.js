const { readFileSync, writeFileSync } = require("fs");

const PLAYERDATAURL = "./database/players.json";
const GAMESDATAURL = "./database/games.json";
const CONFIGDATAURL = "./database/config.json";
const TEAMSDATAURL = "./database/teams.json";

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

function getConfigData() {
    return JSON.parse(readFileSync(CONFIGDATAURL, {
        encoding: "utf-8",
    }))
}

function editConfigData(data) {
    writeFileSync(CONFIGDATAURL, JSON.stringify(data));
}

function getTeamsData() {
    return JSON.parse(readFileSync(TEAMSDATAURL, {
        encoding: "utf-8",
    }))
}

function editTeamsData(data) {
    writeFileSync(TEAMSDATAURL, JSON.stringify(data));
}

module.exports = {
    getPlayersData,
    editPlayersData,
    getGamesData,
    editGamesData,
    getConfigData,
    editConfigData,
    getTeamsData,
    editTeamsData,
}