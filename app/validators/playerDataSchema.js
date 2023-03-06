const Joi = require(`joi`);

const playerDataSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    imageURL: Joi.string(),
    age: Joi.number().min(18).required(),
    type: Joi.string().valid(`batsman`, `baller`, `all-rounder`).required(),
    jerseyNo: Joi.number().required(),
});

module.exports = {
    playerDataSchema,
};
