const { readFileSync, writeFileSync, } = require(`fs`);

const PLAYERDATAURL = `./database/players.json`;
const GAMESDATAURL = `./database/games.json`;
const BALLSDATAURL = `./database/balls.json`;

/**
 * Read and return data in players file.
 * @return {JSON} data in players file
 */
function getPlayersData() {
    return JSON.parse(readFileSync(PLAYERDATAURL, {
        encoding: `utf-8`,
    }));
}

/**
 * Edits data in players file synchronously
 * @param {JSON} data data to put in players file
 */
function editPlayersData(data) {
    writeFileSync(PLAYERDATAURL, JSON.stringify(data));
}

/**
 * Read and return data in games file.
 * @return {JSON} data in games file
 */
function getGamesData() {
    return JSON.parse(readFileSync(GAMESDATAURL, {
        encoding: `utf-8`,
    }));
}

/**
 * Edits data in games file synchronously
 * @param {JSON} data data to put in games file
 */
function editGamesData(data) {
    writeFileSync(GAMESDATAURL, JSON.stringify(data));
}

/**
 * Read and return data in balls file.
 * @return {JSON} data in balls file
 */
function getBallsData() {
    return JSON.parse(readFileSync(BALLSDATAURL, {
        encoding: `utf-8`,
    }));
}

/**
 * Edits data in balls file synchronously.
 * @param {JSON} data data to put in balls file
 */
function editBallsData(data) {
    writeFileSync(BALLSDATAURL, JSON.stringify(data));
}

module.exports = {
    getPlayersData,
    editPlayersData,
    getGamesData,
    editGamesData,
    getBallsData,
    editBallsData,
};
