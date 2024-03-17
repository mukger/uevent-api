const User = require("../Models/User");
const ApiError = require("../utils/ApiError");
const config = require('../config.json');
const TokenService = require("../services/token-service");

class UserController {
    async addAvatar(req, res, next) {
        try {
            const data = await User.addAvatar(req.user.login, req.file.path);

            res.status(201).json(data);
        } catch (e) {
            next(e);
        }
    }

    async changeCurrentUserData(req, res, next) {
        try {

            let user = {
                id: req.user.id
            };

            if(req.body.login) {
                const [userByLogin] = await User.getUserByLogin(req.body.login);
                if (userByLogin.length > 0 && +userByLogin[0].id !== +req.user.id) {
                    return next(ApiError.BadRequest("User with this login already exist"));
                }
                user.login = req.body.login;
            }
            
            if(req.body.email) {
                const [userByEmail] = await User.getUserByEmail(req.body.email);
                if (userByEmail.length > 0 && +userByEmail[0].id !== +req.user.id) {
                    return next(ApiError.BadRequest("User with this email already exist"));
                }
                user.email = req.body.email;
            }

            if(req.body.avatar) {
                user.avatar = req.body.avatar;
            }

            const [changeUserData] = await User.changeUserById(user);
            const [getChangedUserInfo] = await User.getUserById(user.id);

            delete getChangedUserInfo[0].id;

            return res.status(201).json(
                {
                    ...getChangedUserInfo[0]
                });
        } catch (e) {
            next(e);
        }
    }

    async getCurrentUserInformation(req, res, next) {
        try {

            const [getUserDataById] = await User.getUserById(req.user.id);

            delete getUserDataById[0].id;

            return res.status(200).json(
                {
                    ...getUserDataById[0]
                });

        } catch (e) {
            next(e);
        }
    }

    async deleteCurrentUser(req, res, next) {
        try {

            const [deleteUserData] = await User.deleteUserById(req.user.id);

            return res.status(204).json();

        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserController();
