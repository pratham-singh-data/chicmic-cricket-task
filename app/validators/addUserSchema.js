const Joi = require(`joi`);

const addUserSchema = Joi.object({
    name: Joi.string().required(),
    phoneNumber: Joi.string().regex(/^[0-9]{10}$/).required(),
    emailId: Joi.string().email().required(),
    password: Joi.string().min(8).alphanum().required(),
});

module.exports = {
    addUserSchema,
};
