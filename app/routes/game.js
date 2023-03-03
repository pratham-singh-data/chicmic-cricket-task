const express = require("express");
const { scheduleGame, addPlayers, registerBall, getGame, getAllGames, getAllBalls, getBall, deleteBall, updateBall } = require("../controller/gameControllers");
require("../helper/fileDataManipulation");

const router = express.Router({
    caseSensitive: true,
})


router.get("/", getGame, getAllGames);
router.post("/", scheduleGame);
router.post("/ball/:id", registerBall);
router.get("/ball", getBall, getAllBalls),
router.delete("/ball/:id", deleteBall);
router.put("/ball/:id", updateBall)
router.patch("/:id", addPlayers);

module.exports = router;