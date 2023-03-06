/**
 * Sends HTTP reponse to client
 * @param {Response} res express response object
 * @param {JSON} data JSON data to return
 */
function sendResponse(res, data) {
    res.statusCode = data.statusCode;
    res.json(data);
}

module.exports = { sendResponse, };
