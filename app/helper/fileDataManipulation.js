const { readFileSync, writeFileSync, } = require(`fs`);

const PLAYERDATAURL = `./database/players.json`;
const GAMESDATAURL = `./database/games.json`;
const BALLSDATAURL = `./database/balls.json`;

/**
 * Read and return data in file at url.
 * @param {string} url url of file to read
 * @return {string} data in given file
 */
function readData(url) {
    return readFileSync(url, {
        encoding: `utf-8`,
    });
}

/**
 * Read and return data in file at url.
 * @param {string} url url of file in which to write data
 * @param {any} data data to write into file
 */
function editData(url, data) {
    writeFileSync(url, JSON.stringify(data));
}

/**
 * Read and return data in players file.
 * @return {JSON} data in players file
 */
function getPlayersData() {
    return JSON.parse(readData(PLAYERDATAURL));
}

/**
 * Edits data in players file synchronously
 * @param {JSON} data data to put in players file
 */
function editPlayersData(data) {
    editData(PLAYERDATAURL, data);
}

/**
 * Read and return data in games file.
 * @return {JSON} data in games file
 */
function getGamesData() {
    return JSON.parse(readData(GAMESDATAURL));
}

/**
 * Edits data in games file synchronously
 * @param {JSON} data data to put in games file
 */
function editGamesData(data) {
    editData(GAMESDATAURL, data);
}

/**
 * Read and return data in balls file.
 * @return {JSON} data in balls file
 */
function getBallsData() {
    return JSON.parse(readData(BALLSDATAURL));
}

/**
 * Edits data in balls file synchronously.
 * @param {JSON} data data to put in balls file
 */
function editBallsData(data) {
    editData(BALLSDATAURL, data);
}

module.exports = {
    getPlayersData,
    editPlayersData,
    getGamesData,
    editGamesData,
    getBallsData,
    editBallsData,
};
