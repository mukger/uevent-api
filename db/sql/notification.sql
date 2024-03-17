USE uevent;

CREATE TABLE IF NOT EXISTS notification (
    notification_id INT(8) UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user_id INT(8) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    event_id INT(8),
    FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE SET NULL,
    company_id INT(8) UNSIGNED,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE SET NULL,
    ndescription TEXT NOT NULL,
    notification_date DATETIME NOT NULL
);