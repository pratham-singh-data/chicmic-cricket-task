const express = require("express");
const { addPlayer, readPlayer } = require("../controller/playerControllers");
const router = express.Router({
    caseSensitive: true,
})

router.post("/", addPlayer)

router.get("/", readPlayer)

module.exports = router;