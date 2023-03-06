const Joi = require(`joi`);
const { getUsersData,
    editUsersData, } = require('../helper/fileDataManipulation');
const { hashPassword, } = require('../util/hashPassword');
const { sendResponse, } = require('../util/sendResponse');
const { addUserSchema, } = require('../validators/addUserSchema');
const jwt = require(`jsonwebtoken`);
const { SECRETKEY, } = require('../../config');
const { RegisteredEmail, CredentialDoNotMatch, } = require('../util/messages');
const { loginUserSchema, } = require('../validators/loginUserSchema');

/**
 * Registers a user in the database
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {next} next express next function
 */
function registerUser(req, res, next) {
    let body;

    try {
        body = Joi.attempt(req.body, addUserSchema);
    } catch (err) {
        sendResponse(res, {
            statusCode: 400,
            message: err.message,
        });
        return;
    }

    const usersFileData = getUsersData();

    if (usersFileData[body.emailId]) {
        sendResponse(res, {
            statusCode: 403,
            message: RegisteredEmail,
        });
        return;
    }

    usersFileData[body.emailId] = body;
    body.password = hashPassword(body.password);

    const token = jwt.sign({
        id: body.emailId,
    }, SECRETKEY, {
        expiresIn: `30 minutes`,
    });

    editUsersData(usersFileData);

    sendResponse(res, {
        statusCode: 200,
        token: token,
    });
}

/**
 * Logs in a registerred user
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {next} next express next function
 */
function loginUser(req, res, next) {
    let body;

    try {
        body = Joi.attempt(req.body, loginUserSchema);
    } catch (err) {
        sendResponse(res, {
            statusCode: 400,
            message: err.message,
        });
        return;
    }

    const usersFileData = getUsersData();

    if (! usersFileData[body.emailId] ||
        usersFileData[body.emailId].password !== hashPassword(body.password)) {
        sendResponse(res, {
            statusCode: 403,
            message: CredentialDoNotMatch,
        });
        return;
    }

    const token = jwt.sign({
        id: body.emailId,
    }, SECRETKEY, {
        expiresIn: `30 minutes`,
    });

    sendResponse(res, {
        statusCode: 200,
        token: token,
    });
}

module.exports = {
    registerUser,
    loginUser,
};
