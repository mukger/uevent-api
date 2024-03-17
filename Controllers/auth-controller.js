const Auth = require("../Models/Auth");
const ApiError = require("../utils/ApiError");
const TokenService = require("../services/token-service")
const bcrypt = require("bcrypt");

class AuthController {
    async register(req, res, next) {
        try {
            if (!req.body.login || !req.body.email || !req.body.password) {
                return next(ApiError.BadRequest("Check all fields"));
            }

            const [userByLogin] = await Auth.getUserByLogin(req.body.login);
            if (userByLogin.length > 0) {
                return next(ApiError.BadRequest("User with this login already exist"));
            }

            const [userByEmail] = await Auth.getUserByEmail(req.body.email);
            if (userByEmail.length > 0) {
                return next(ApiError.BadRequest("User with this email already exist"));
            }

            const data = await Auth.addUser(req.body)

            let tokens = TokenService.generateTokens({
                login: req.body.login,
                email: req.body.email,
                id: data[0].insertId,
                user_role: 'user'
            });

            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})

            return res.status(201).json(
                {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                });
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            if (!req.body.login || !req.body.password) {
                return next(ApiError.BadRequest("Check all fields"));
            }

            const [user] = await Auth.getUserByLogin(req.body.login);
            if (user.length === 0) {
                return next(ApiError.BadRequest("User with this login not found"));
            }

            let isPassword = bcrypt.compareSync(req.body.password, user[0].password);
            if (isPassword) {
                let tokens = TokenService.generateTokens({
                    login: user[0].login,
                    email: user[0].email,
                    id: user[0].id,
                    user_role: user[0].user_role
                });

                res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})

                return res.status(201).json(
                    {
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                    });
            }

            return res.json(user);
        } catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            if (!refreshToken) {
                return next(ApiError.Unauthorized());
            }

            const userData = TokenService.validateRefreshToken(refreshToken);
            if(!userData) {
                return next(ApiError.Unauthorized());
            }
            let tokens = TokenService.generateTokens({
                login: userData.login,
                email: userData.email,
                id: userData.id,
                user_role: userData.user_role
            });

            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})

            return res.status(201).json(
                {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                });

        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            res.clearCookie('refreshToken');
            res.status(200).json('logout');
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new AuthController();
