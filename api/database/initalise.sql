-- Users of the app
CREATE TABLE IF NOT EXISTS `Users`(
    user_id BIGINT PRIMARY KEY,
    `username` VARCHAR(255) NOT NULL,
    `wallet` DECIMAL(12,2) DEFAULT 1000
);


-- Stocks listed in the app
CREATE TABLE IF NOT EXISTS `Stocks` (
    stock_id INT PRIMARY KEY AUTO_INCREMENT,
    `symbol` VARCHAR(255) NOT NULL UNIQUE,
    `name` VARCHAR(255) NOT NULL
);

-- Price history for each stock
CREATE TABLE IF NOT EXISTS `StockPrices` (
    price_id INT PRIMARY KEY AUTO_INCREMENT,
    stock_id INT NOT NULL,
    `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `price` DECIMAL(10, 2) NOT NULL,
    UNIQUE(stock_id, `date`),
    FOREIGN KEY (stock_id) REFERENCES `Stocks`(stock_id)
);

-- What each user currently owns
CREATE TABLE IF NOT EXISTS `UserHoldings` (
    holding_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    stock_id INT NOT NULL,
    `quantity` INT NOT NULL CHECK (`quantity` >= 0),
    UNIQUE(user_id, stock_id),
    FOREIGN KEY (user_id) REFERENCES `Users`(user_id),
    FOREIGN KEY (stock_id) REFERENCES `Stocks`(stock_id)
);

-- Record of user transactions
CREATE TABLE IF NOT EXISTS `Transactions` (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    stock_id INT NOT NULL,
    `type` ENUM('BUY', 'SELL') NOT NULL,
    `quantity` INT NOT NULL CHECK (`quantity` > 0),
    `price` DECIMAL(10, 2) NOT NULL,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES `Users`(user_id),
    FOREIGN KEY (stock_id) REFERENCES `Stocks`(stock_id)
);
