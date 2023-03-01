require("dotenv").config();
const express = require("express");
const PlayerRouter = require("./app/routes/player");

const app = express();
app.use(express.json());

app.use("/player", PlayerRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server running at port ${process.env.PORT}`);
})