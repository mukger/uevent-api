USE uevent;

CREATE TABLE IF NOT EXISTS ticket (
    ticket_id VARCHAR(255) PRIMARY KEY NOT NULL,
    user_id INT(11),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    event_id INT(8),
    FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE SET NULL,
    promocode_id INT(8) UNSIGNED,
    FOREIGN KEY (promocode_id) REFERENCES promocode(promocode_id) ON DELETE SET NULL,
    purchase_date DATETIME NOT NULL,
    show_visit TINYINT(3) NOT NULL DEFAULT 1
);