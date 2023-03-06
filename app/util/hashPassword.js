const crypto = require(`crypto`);
const { SALT, } = require('../../config');

/**
 * Returns hash of goven password
 * @param {string} password password whose hash is to be generated
 * @return {string} hashed password
 */
function hashPassword(password) {
    const hash = crypto.pbkdf2Sync(password, SALT, 1000, 64, `sha256`).
        toString(`hex`);
    return hash;
}

module.exports = {
    hashPassword,
};
