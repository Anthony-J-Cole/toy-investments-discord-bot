INSERT INTO transactions (`user_id`, `stock_id`, `type`, `quantity`, `price`) VALUES (1,3,'BUY', 10,11.50)


SELECT wallet FROM users WHERE user_id = ?


SELECT user_id, username FROM users WHERE user_id = 170261072815718400

INSERT INTO users (user_id, username) VALUES (170261072815718400,'test')

DELETE FROM users WHERE user_id = 170261072815718400


SELECT stocks.symbol, stocks.name, stockprices.price
FROM stocks
INNER JOIN stockprices ON stocks.stock_id = stockprices.stock_id
WHERE stocks.symbol = '$D20'
ORDER BY stockprices.date DESC;


SELECT wallet FROM users WHERE user_id = 170261072815718400


SELECT quantity FROM UserHoldings WHERE stock_id = 3 AND user_id = 170261072815718400

SELECT 
    users.username, 
    users.wallet, 
    stocks.symbol, 
    UserHoldings.quantity, 
    sp_latest.price
FROM users 
INNER JOIN UserHoldings ON users.user_id = UserHoldings.user_id
INNER JOIN stocks ON UserHoldings.stock_id = stocks.stock_id
INNER JOIN (
    SELECT sp1.stock_id, sp1.price
    FROM stockprices sp1
    INNER JOIN (
        SELECT stock_id, MAX(date) AS latest_date
        FROM stockprices
        GROUP BY stock_id
    ) sp2 ON sp1.stock_id = sp2.stock_id AND sp1.date = sp2.latest_date
) AS sp_latest ON stocks.stock_id = sp_latest.stock_id
WHERE users.user_id = 170261072815718400;



INSERT INTO stockprices(stock_id, price) VALUES (7, 11)


SELECT stockprices.date, stockprices.price, stocks.name 
FROM stockprices
INNER JOIN stocks ON stockprices.stock_id = stocks.stock_id
WHERE stockprices.stock_id = 3;


UPDATE stocks
SET description = "Leave your fate in RNJesus hands - Wait is that bandits coming! Ruuuuun!!"
WHERE stock_id = 3



SELECT 
    u.user_id,
    u.username,
    u.wallet,
    s.symbol AS stock_symbol,
    s.name AS stock_name,
    uh.quantity,
    sp.price AS latest_price,
    (uh.quantity * sp.price) AS holding_value
FROM Users u
LEFT JOIN UserHoldings uh ON u.user_id = uh.user_id
LEFT JOIN Stocks s ON uh.stock_id = s.stock_id
LEFT JOIN (
    SELECT sp1.stock_id, sp1.price
    FROM StockPrices sp1
    INNER JOIN (
        SELECT stock_id, MAX(`date`) AS max_date
        FROM StockPrices
        GROUP BY stock_id
    ) sp2 ON sp1.stock_id = sp2.stock_id AND sp1.`date` = sp2.max_date
) sp ON s.stock_id = sp.stock_id
ORDER BY u.user_id, s.symbol;
