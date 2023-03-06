const Joi = require(`joi`);
const { MINPASSWORDLEN, } = require('../util/constants');
const { InvalidPhoneNumberError, } = require('../util/messages');

const addUserSchema = Joi.object({
    name: Joi.string().required(),
    phoneNumber: Joi.string().regex(/^[0-9]{10}$/).
        message(InvalidPhoneNumberError).
        required(),
    emailId: Joi.string().email().required(),
    password: Joi.string().min(MINPASSWORDLEN).alphanum().required(),
});

module.exports = {
    addUserSchema,
};
