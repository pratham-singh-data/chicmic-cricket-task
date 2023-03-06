const Joi = require(`joi`);
const { MINPASSWORDLEN, } = require('../util/constants');

const loginUserSchema = Joi.object({
    emailId: Joi.string().email().required(),
    password: Joi.string().min(MINPASSWORDLEN).alphanum().required(),
});

module.exports = {
    loginUserSchema,
};
