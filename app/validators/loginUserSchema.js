const Joi = require(`joi`);

const loginUserSchema = Joi.object({
    emailId: Joi.string().email().required(),
    password: Joi.string().min(8).alphanum().required(),
});

module.exports = {
    loginUserSchema,
};
