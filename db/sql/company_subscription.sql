USE uevent;

CREATE TABLE IF NOT EXISTS company_subscription (
    user_id INT(8) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    company_id INT(8) UNSIGNED NOT NULL,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, company_id),
    notify TINYINT(3) NOT NULL DEFAULT 1
);