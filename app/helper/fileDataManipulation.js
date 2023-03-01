const { readFileSync, writeFileSync } = require("fs");

const PLAYERDATAURL = "./database/players.json";
const TEAMDATAURL = "./database/teams.json";

function getPlayersData() {
    return JSON.parse(readFileSync(PLAYERDATAURL, {
        encoding: "utf-8",
    }))
}

function editPlayersData(data) {
    writeFileSync(PLAYERDATAURL, JSON.stringify(data));
}

function getTeamsData() {
    return JSON.parse(readFileSync(TEAMDATAURL, {
        encoding: "utf-8",
    }))
}

function editTeamsData(data) {
    writeFileSync(TEAMDATAURL, JSON.stringify(data));
}

module.exports = {
    getPlayersData,
    editPlayersData,
    getTeamsData,
}