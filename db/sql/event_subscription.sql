USE uevent;

CREATE TABLE IF NOT EXISTS event_subscription (
    user_id INT(8) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    event_id INT(8) NOT NULL,
    FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, event_id),
    notify TINYINT(3) NOT NULL DEFAULT 1
);