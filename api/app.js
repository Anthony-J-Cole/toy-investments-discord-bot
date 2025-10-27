import express from 'express'
import cors from 'cors'
import chalk from 'chalk'
import db from './db.js'
import env from 'dotenv/config'
import { createTransaction } from './src/transactions.js'
import { createuser, getUserSummary, getLeaderboard } from './src/users.js'
import { getPriceHistory, getStockPrice, getAllStocks } from './src/stocks.js'
import { updateStockPrices } from './src/updateStockPrices.js'


const app = express();

app.use(cors())
app.use(express.json())
app.use('/images',express.static('public/images'))

const PORT = process.env.API_PORT || 3001

app.listen(PORT, () => {
    console.log(chalk.green(`Server is running on http://localhost:${PORT}`))
    updateStockPrices()

    setInterval(time => 
    {
        updateStockPrices()
    }, 30 * 60 * 1000 // 30 mins 
    )
})

app.get('/stocks/price/:id',getStockPrice)
app.get('/stocks/:id',getPriceHistory)
app.get('/stocks', getAllStocks)
app.get('/users/:id', getUserSummary)
app.get('/leaderboard',getLeaderboard)

app.post('/transaction',createTransaction)
app.post('/users', createuser)
