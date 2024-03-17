USE uevent;

CREATE TABLE event (
    event_id INT(8) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    company_id INT(8) UNSIGNED NOT NULL,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    execution_date DATETIME NOT NULL,
    edescription TEXT NOT NULL,
    notify_subscription TINYINT(3) NOT NULL DEFAULT 1,
    show_subscribers TINYINT(3) NOT NULL DEFAULT 1,
    publication_date DATETIME,
    format ENUM ('conference', 'lecture', 'workshop', 'fest', 'contest', 'concert') NOT NULL,
    theme ENUM ('business', 'politic', 'psychology', 'sport', 'religion') NOT NULL,
    ticket_price INT(8) NOT NULL,
    ticket_count INT(8) NOT NULL,
    ticket_limit INT(8) NOT NULL,
    picture TEXT NOT NULL
);