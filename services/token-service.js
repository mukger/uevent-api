const jwt = require('jsonwebtoken');
const config = require('../config.json');

const JWT_ACCESS_SECRET = config.jwt.jwt_access_secret;
const JWT_REFRESH_SECRET = config.jwt.jwt_refresh_secret;

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {expiresIn: config.jwt.access_expire_at})
        const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {expiresIn: config.jwt.refresh_expire_at})
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) {
        try {
            return jwt.verify(token, JWT_ACCESS_SECRET);
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            return jwt.verify(token, JWT_REFRESH_SECRET);
        } catch (e) {
            return null;
        }
    }
}

module.exports = new TokenService();