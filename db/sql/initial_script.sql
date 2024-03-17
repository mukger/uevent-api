SET GLOBAL validate_password.policy = 0;
CREATE USER IF NOT EXISTS 'vkharkivsk'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'vkharkivsk'@'localhost' WITH GRANT OPTION;
CREATE DATABASE IF NOT EXISTS uevent;