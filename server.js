require(`dotenv`).config();
const express = require(`express`);
const PlayerRouter = require(`./app/routes/player`);
const GameRouter = require(`./app/routes/game`);
const UserRouter = require(`./app/routes/users`);
const { sendResponse, } = require(`./app/util/sendResponse`);
const { checkAuthToken, } = require('./app/helper/checkAuthToken');

const app = express();
app.use(express.json(), (err, req, res, next) => {
    sendResponse(res, {
        statusCode: 400,
        message: err.message,
    });
});

app.use(`*`, checkAuthToken);

app.use(`/player`, PlayerRouter);
app.use(`/game`, GameRouter);
app.use(`/user`, UserRouter);

app.all(`*`, (err, req, res, next) => {
    sendResponse(res, {
        statusCode: 500,
        message: err.message,
    });
}, (req) => {
    sendResponse(req.res, {
        statusCode: 404,
        message: `Unknown Endpoint: ${req.url}`,
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running at port ${process.env.PORT}`);
});
