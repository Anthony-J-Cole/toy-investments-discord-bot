CREATE TRIGGER update_user_holdings_after_transaction
AFTER INSERT ON Transactions
FOR EACH ROW
BEGIN
    DECLARE existing_quantity INT;
    DECLARE current_wallet DECIMAL(12,2);
    DECLARE total_amount DECIMAL(12,2);

    -- Calculate total transaction amount
    SET total_amount = NEW.quantity * NEW.price;

    -- Get current wallet balance
    SELECT wallet INTO current_wallet FROM Users WHERE user_id = NEW.user_id;

    -- Check if the user already holds this stock
    SELECT quantity INTO existing_quantity
    FROM UserHoldings
    WHERE user_id = NEW.user_id AND stock_id = NEW.stock_id;

    IF ROW_COUNT() = 0 THEN
        SET existing_quantity = NULL;
    END IF;

    -- Handle BUY
    IF NEW.type = 'BUY' THEN
        -- Only proceed if user has enough wallet balance
        IF current_wallet >= total_amount THEN
            IF existing_quantity IS NOT NULL THEN
                -- Update existing holding
                UPDATE UserHoldings
                SET quantity = quantity + NEW.quantity
                WHERE user_id = NEW.user_id AND stock_id = NEW.stock_id;
            ELSE
                -- Insert new holding
                INSERT INTO UserHoldings (user_id, stock_id, quantity)
                VALUES (NEW.user_id, NEW.stock_id, NEW.quantity);
            END IF;

            -- Deduct from wallet
            UPDATE Users
            SET wallet = wallet - total_amount
            WHERE user_id = NEW.user_id;
        END IF;

    -- Handle SELL
    ELSEIF NEW.type = 'SELL' THEN
        IF existing_quantity IS NOT NULL AND existing_quantity >= NEW.quantity THEN
            -- Reduce holding
            UPDATE UserHoldings
            SET quantity = quantity - NEW.quantity
            WHERE user_id = NEW.user_id AND stock_id = NEW.stock_id;

            -- Add to wallet
            UPDATE Users
            SET wallet = wallet + total_amount
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;

END;
