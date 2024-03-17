USE uevent;

CREATE TABLE IF NOT EXISTS user_promocode (
    user_id INT(11) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    promocode_id INT(8) UNSIGNED NOT NULL,
    FOREIGN KEY (promocode_id) REFERENCES promocode(promocode_id) ON DELETE CASCADE,
    PRIMARY KEY(user_id, promocode_id),
    activation_date DATETIME NOT NULL
);