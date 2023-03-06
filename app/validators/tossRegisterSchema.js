const Joi = require(`joi`);

const tossRegisterSchema = Joi.object({
    toss: Joi.number().valid(1, 2).required(),
    firstBatter: Joi.number().valid(1, 2).required(),
});

module.exports = {
    tossRegisterSchema,
};
