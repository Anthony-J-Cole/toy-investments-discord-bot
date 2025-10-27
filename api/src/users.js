import chalk from "chalk";
import db from "../db.js";

export async function createuser(request, response)
{
    const user_id = request.body.user_id;
    const name = request.body.name;
    //Test to see if user exists
    const testUserSQL = `SELECT user_id, username FROM users WHERE user_id = ?`;
    const [testResult, testFields] = await db.query(testUserSQL,[user_id]);
    if(testResult.length >0)
    {
        const [updateResult, updateFeilds] = await db.query(`UPDATE users SET username = ? WHERE user_id = ? LIMIT 1`, [name,user_id])
        response.status(200).send({message: `Updated ${user_id} name to ${name}`})
        return
    }
    else
    {
        const createUserSql = `INSERT INTO users (user_id, username) VALUES (?,?)`;
        const [result,fields] = await db.query(createUserSql,[user_id ,name]);
        response.status(200).send({message: `Created user with name: ${name}`})
        return
    }
}

export async function getUserSummary(request, response) {
    try {
        const user_id = request.params.id;

        const [result] = await db.query(
            `SELECT 
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
WHERE users.user_id = ?;`,
            [user_id]
        );

        if (result.length === 0) {
            return response.status(404).send({ error: "User not found or no holdings" });
        }

        const { username: name, wallet } = result[0];

        const stockinfo = result.map(row => ({
            symbol: row.symbol,
            quantity: row.quantity,
            price: row.price
        }));

        return response.status(200).send({
            headers:{"Content-Type": "application/json"},
            body:{
                name,
                wallet,
                stocks: stockinfo
            }
        });

    } catch (error) {
        console.error("Error fetching user summary:", error);
        return response.status(500).send({ error: "Internal Server Error" });
    }
}

export async function getLeaderboard(request, response) {
    const [lbResults, lbFields] = await db.query(
        `SELECT 
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
        SELECT stock_id, MAX('date') AS max_date
        FROM StockPrices
        GROUP BY stock_id
    ) sp2 ON sp1.stock_id = sp2.stock_id AND sp1.date = sp2.max_date
) sp ON s.stock_id = sp.stock_id
ORDER BY u.user_id, s.symbol;`,[])

    let users = new Map()
    //For each user get a toatl
    lbResults.forEach(row => {
        if(users.has(row.id))
        {
            let index = users.get(row.id)
            index.value = {name: index.name, total: index.total + row.holding_value}
        }
        else
        {
            users.set(row.id, {name: row.username, total: row.holding_value})
        }
    });

    response.status(200).send( {headers:{"Content-Type": "application/json"},
            body: lbResults})
    
}