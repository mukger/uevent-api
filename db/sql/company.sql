USE uevent;

CREATE TABLE IF NOT EXISTS company (
    company_id INT(8) UNSIGNED AUTO_INCREMENT NOT NULL,
    user_id INT(11) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY(company_id, user_id),
    cname VARCHAR(60) UNIQUE NOT NULL,
    cpicture VARCHAR(255) DEFAULT NULL,
    cemail VARCHAR(255) UNIQUE NOT NULL,
    create_date DATETIME NOT NULL,
    company_account VARCHAR(255) UNIQUE NOT NULL
);