const jwt = require('jsonwebtoken');
const { SECRETKEY, } = require('../../config');
const { PUBLICURLS, } = require('../util/constants');
const { ReadNonExistentUser, } = require('../util/messages');
const { sendResponse, } = require('../util/sendResponse');
const { getUsersData, } = require('./fileDataManipulation');

/**
 * Checks if user is registerred or not
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {function} next express next function
 */
function checkAuthToken(req, res, next) {
    if (PUBLICURLS.includes(req.originalUrl)) {
        next();
        return;
    }

    let id;
    try {
        ({ id, } = jwt.verify(req.headers.token, SECRETKEY));
    } catch (err) {
        sendResponse(res, {
            statusCode: 400,
            message: err.message,
        });
        return;
    }

    const usersFileData = getUsersData();

    if (! usersFileData[id]) {
        sendResponse(res, {
            statusCode: 403,
            message: ReadNonExistentUser,
        });
        return;
    }

    next();
}

module.exports = {
    checkAuthToken,
};
