const db = require('../db/db');

class User {
    addAvatar(login, path) {
        return db.query('UPDATE users SET avatar = ? WHERE login = ? ', ['/' + path, login]);
    }

    getUserById(user_id) {
        return db.query('SELECT * FROM users WHERE id = ?', user_id);
    }

    changeUserById(user) {
        return db.query('UPDATE users SET ? WHERE id = ?', [user, user.id]);
    }

    getUserByLogin(login) {
        return db.query('SELECT * FROM users WHERE login = ?', login);
    }

    getUserByEmail(email) {
        return db.query('SELECT * FROM users WHERE email = ?', email);
    }

    deleteUserById(user_id) {
        return db.query('DELETE FROM users WHERE id = ?', user_id);
    }
}

module.exports = new User();