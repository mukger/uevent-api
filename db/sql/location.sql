USE uevent;

CREATE TABLE IF NOT EXISTS location (
    location_id INT(8) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    event_id INT(8),
    FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE,
    company_id INT(8) UNSIGNED,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    name_place VARCHAR(255) NOT NULL,
    latitude DOUBLE(16,13),
    longitude DOUBLE(16,13)
);