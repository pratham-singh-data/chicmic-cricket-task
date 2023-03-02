const express = require("express");
const { scheduleGame, addPlayers, registerBall } = require("../controller/gameControllers");
require("../helper/fileDataManipulation");

const router = express.Router({
    caseSensitive: true,
})


router.post("/", scheduleGame);
router.post("/ball/:id", registerBall);
router.patch("/:id", addPlayers);

module.exports = router;