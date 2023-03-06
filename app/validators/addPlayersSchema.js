const Joi = require(`joi`);

const addPlayersSchema = Joi.object({
    team1: Joi.array().items(Joi.string()).required(),
    team2: Joi.array().items(Joi.string()).required(),
});

module.exports = {
    addPlayersSchema,
};
