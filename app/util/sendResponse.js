function sendResponse(res, data) {
    res.statusCode = data.statusCode;
    res.json(data);
}

module.exports = { sendResponse }