const express = require("express");
const { scheduleGame, addPlayers, registerBall, getGame, getAllGames } = require("../controller/gameControllers");
require("../helper/fileDataManipulation");

const router = express.Router({
    caseSensitive: true,
})


router.get("/", getGame, getAllGames);
router.post("/", scheduleGame);
router.post("/ball/:id", registerBall);
router.patch("/:id", addPlayers);

module.exports = router;