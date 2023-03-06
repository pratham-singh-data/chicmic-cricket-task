const Joi = require(`joi`);

const updateBallSchema = Joi.object({
    playerOnStrike: Joi.string().required(),
    playerOnSide: Joi.
        string().
        disallow(Joi.ref(`playerOnStrike`)).
        required(),
    bowler: Joi.
        string().
        disallow(Joi.ref(`playerOnStrike`), Joi.ref(`playerOnSide`)).
        required(),
    ball: Joi.number().min(1).required(),
    over: Joi.number().min(1).required(),
    valid: Joi.string().valid(`V`, `W`, `N`).required(),
    runs: Joi.number().min(0).max(6).required(),
    playerOut: Joi.boolean().required(),
    wicketType: Joi.
        string().
        valid(`lbw`, `runOut`, `caught`, `stump`, `bowled`, `hitWicket`),
    gid: Joi.string().required(),
});

module.exports = {
    updateBallSchema,
};
