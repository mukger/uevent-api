USE uevent;

CREATE TABLE IF NOT EXISTS comment (
    comment_id INT(8) UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
    user_id INT(11) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    event_id INT(8),
    FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE,
    company_id INT(8) UNSIGNED,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    comment_date DATETIME NOT NULL,
    comment_text TEXT NOT NULL,
    is_modified TINYINT(1) NOT NULL DEFAULT 0
);