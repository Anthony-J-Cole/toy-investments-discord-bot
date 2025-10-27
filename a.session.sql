CREATE TABLE IF NOT EXISTS `User` (
    id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `wallet` INT NOT NULL DEFAULT 1000,
    `discord_id` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `Companies` (
    id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `ticker` VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS `investment` (
    id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `company_id` int(11) NOT NULL,
    `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `amount` INT(11) NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES User(id),
    FOREIGN KEY (`company_id`) REFERENCES Companies(id)
);

CREATE TABLE IF NOT EXISTS `PriceHistory` (
    id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `company_id` int(11) NOT NULL,
    `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `price` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`company_id`) REFERENCES Companies(id)
);


