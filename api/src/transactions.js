import chalk from "chalk";
import db from "../db.js";

const Transaction = function (data){
    this.user_id = data.user_id,
    this.stock_id = data.stock_id,
    this.type = data.type
    this.quantity = data.quantity,
    this.price = null,
    this.total = null
}

export async function createTransaction(request,response) 
{
    console.log(chalk.bgGreen(`Starting create transaction...`))
    if(!request.body)
    {
        response.status(400).send({message: `Must have a body`})
        return;
    }
    const createTransaction = new Transaction(request.body)
    
    const [priceResult, priceFields] = await db.query(
        `SELECT stockprices.price
FROM stocks
INNER JOIN stockprices ON stocks.stock_id = stockprices.stock_id
WHERE stocks.symbol = ?
ORDER BY stockprices.date DESC
LIMIT 1;`,[createTransaction.stock_id]
    )
    createTransaction.price = priceResult[0].price;

    createTransaction.total = createTransaction.price * createTransaction.quantity

    if(createTransaction.type == 'BUY')
    {
        //See if the user has enough to buy the stock
        console.log(chalk.bgRed(`${createTransaction.user_id} is trying to buy ${createTransaction.quantity} stocks of ${createTransaction.stock_id} for ${createTransaction.total} total`))
        const [walletResult, walletFields] = await db.query(
            `SELECT wallet FROM users WHERE user_id = ?`,[createTransaction.user_id]
        )
        if(await walletResult[0].wallet < createTransaction.total)
        {
            console.log(chalk.bgMagenta(`Not enough funds to complete transaction`))
            response.status(200).send({message: "Not enough funds to complete transaction"})
            return;
        }
        else{
            const [stockIdResult, stockIdFields] = await db.query(
                `SELECT stock_id FROM stocks WHERE symbol = ?`, [createTransaction.stock_id]
            )
            const sID = await stockIdFromTicker(createTransaction.stock_id)
            const [transactionResult, transactionFields] = await db.query(
                `INSERT INTO transactions(user_id, stock_id, type, quantity, price) VALUES (?,?,?,?,?)`,
                [createTransaction.user_id, sID, createTransaction.type, createTransaction.quantity, createTransaction.price]
            )

            const output = {message: `Transaction Complete!`, total: createTransaction.total}
            response.status(200).send(output)
            return;
        }
    }
    if(createTransaction.type == 'SELL')
    {
        const sID = await stockIdFromTicker(createTransaction.stock_id);
        const [stockResult, stockFields] = await db.query(
            `SELECT quantity FROM userholdings WHERE stock_id = ? AND user_id = ?`,[sID, createTransaction.user_id]
        )
        if(stockResult[0].quantity < createTransaction.quantity)
        {
            console.log(chalk.red(`Cant sell more stocks then you have`))
            response.status(200).send({message: `Cant sell more stocks then you have`})
            return;
        }
        else
        {
            const [transactionResult, transactionFields] = await db.query(
                `INSERT INTO transactions(user_id, stock_id, type, quantity, price) VALUES (?,?,?,?,?)`,
                [createTransaction.user_id, sID, createTransaction.type, createTransaction.quantity, createTransaction.price]
            )
            const output = {message: `Transaction Complete!`, total: createTransaction.total}
            response.status(200).send(output)
            return;
        }
    }
}

export async function stockIdFromTicker(ticker)
{
    const [stockIdResult, stockIdFields] = await db.query(`SELECT stock_id FROM stocks WHERE symbol = ?`, [ticker])
    return await stockIdResult[0].stock_id;
}