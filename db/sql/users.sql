USE uevent;

CREATE TABLE IF NOT EXISTS users (
    id INT(11) AUTO_INCREMENT NOT NULL,
    login VARCHAR(31) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    email VARCHAR(63) NOT NULL UNIQUE,
    user_role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    PRIMARY KEY (id)
);