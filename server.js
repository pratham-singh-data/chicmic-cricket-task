require("dotenv").config();
const express = require("express");
const PlayerRouter = require("./app/routes/player");

const app = express();
app.use(express.json(), (err, req, res, next) => {
    res.json({
        statusCode: 400,
        message: err.message,
    })
});

app.use("/player", PlayerRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server running at port ${process.env.PORT}`);
})