const db = require('../db/db');
const bcrypt = require('bcrypt');
const config = require('../config.json');

const saltRounds = config.register.salt_rounds;

class Auth {
    addUser(user) {
        let sqlUser = {
            login: user.login,
            password: bcrypt.hashSync(user.password, bcrypt.genSaltSync(saltRounds)),
            avatar: config.register.default_image,
            email: user.email
        };
        return db.query('INSERT INTO users SET ?', sqlUser);
    }

    getUserByLogin(login) {
        return db.query('SELECT * FROM users WHERE login = ?', login);
    }

    getUserByEmail(email) {
        return db.query('SELECT * FROM users WHERE email = ?', email);
    }

}

module.exports = new Auth()