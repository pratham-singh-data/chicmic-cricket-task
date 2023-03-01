const express = require("express");
const { scheduleGame, addPlayers } = require("../controller/gameControllers");
require("../helper/fileDataManipulation");

const router = express.Router({
    caseSensitive: true,
})


router.post("/", scheduleGame);
router.patch("/:id", addPlayers);

module.exports = router;