const express = require(`express`);
const { registerUser, loginUser, } = require('../controller/userControllers');

// eslint-disable-next-line new-cap
const router = express.Router({
    caseSensitive: true,
});

router.post(`/register`, registerUser);
router.post(`/login`, loginUser);

module.exports = router;
