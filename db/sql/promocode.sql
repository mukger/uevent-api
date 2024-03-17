USE uevent;

CREATE TABLE IF NOT EXISTS promocode (
    promocode_id INT(8) UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT,
    event_id INT(8),
    FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE,
    company_id INT(8) UNSIGNED,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    expiration_date DATETIME NOT NULL,
    promocode VARCHAR(255) NOT NULL UNIQUE,
    discount TINYINT(3) NOT NULL
);