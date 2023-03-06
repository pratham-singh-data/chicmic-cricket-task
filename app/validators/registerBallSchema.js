const Joi = require(`joi`);

const registerBallSchema = Joi.object({
    player_on_strike: Joi.string().required(),
    player_on_side: Joi.
        string().
        disallow(Joi.ref(`player_on_strike`)).
        required(),
    bowler: Joi.
        string().
        disallow(Joi.ref(`player_on_strike`), Joi.ref(`player_on_side`)).
        required(),
    ball: Joi.number().min(1).required(),
    over: Joi.number().min(1).required(),
    valid: Joi.string().valid(`V`, `W`, `N`).required(),
    runs: Joi.number().min(0).max(6).required(),
    playerOut: Joi.boolean().required(),
    wicketType: Joi.
        string().
        valid(`lbw`, `runOut`, `caught`, `stump`, `bowled`, `hitWicket`),
});

module.exports = {
    registerBallSchema,
};
