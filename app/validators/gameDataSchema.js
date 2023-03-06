const Joi = require(`joi`);
const MINPLAYERREQ = 11;

const gameDataSchema = Joi.object({
    team1: Joi.string().required(),
    team2: Joi.string().required(),
    team1Players: Joi.array().items(Joi.string()).min(MINPLAYERREQ).required(),
    team2Players: Joi.array().items(Joi.string()).min(MINPLAYERREQ).required(),
    maxOvers: Joi.number().min(1),
    venue: Joi.string().required(),
    date: Joi.date().required(),
});

module.exports = {
    gameDataSchema,
};
