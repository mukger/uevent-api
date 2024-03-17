const ApiError = require("../utils/ApiError");
const TokenService = require("../services/token-service");

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.Unauthorized());
        }

        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            return next(ApiError.Unauthorized());
        }

        const userData = TokenService.validateAccessToken(accessToken);
        if (!userData) {
            return next(ApiError.Unauthorized());
        }

        req.user = userData;

        next();
    } catch (e) {
        return next(ApiError.Unauthorized());
    }
};
