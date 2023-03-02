const express = require("express");
const { addPlayer, readPlayer, readAllPlayers } = require("../controller/playerControllers");
const router = express.Router({
    caseSensitive: true,
});

router.post("/", addPlayer);
router.get("/", readPlayer, readAllPlayers);

module.exports = router;