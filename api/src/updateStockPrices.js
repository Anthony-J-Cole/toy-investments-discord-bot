import chalk from 'chalk';
import db from '../db.js'
const stock_ids = {
    $SCAM : 1,
    $WC: 2,
    $D20: 3,
    $SS: 4,
    $DAGS: 5,
    $RRT: 6,
    $VFB: 7,
    $PP: 8,
    $FWI: 9
}

export async function updateStockPrices() {
    const priceGenerators = {
        1: getScamPrice,
        2: getRandomOne,
        3: getd20Price,
        4: getNextPriceMomentum,
        5: getNextPriceRandomWalk,
        6: getNextPriceRRT,
        7: getNextPriceGBM, //VFB Seasonal effect base
        8: getNextPriceGBM,
        9: getNextPriceMeanReversion
    };
    
    const stockEntries = await Promise.all(
        Object.entries(stock_ids).map(async ([, stock_id]) => {
            const price = await priceGenerators[stock_id](stock_id);
            return [stock_id, price];
        })
    );

    const placeholders = stockEntries.map(() => '(?, ?)').join(', ');
    const values = stockEntries.flat();

    await db.query(
        `INSERT INTO stockprices(stock_id, price) VALUES ${placeholders}`,
        values
    );

    let currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 30);
    console.log(chalk.bgBlue(`UPDATING PRICES\nNext automatic update at: ${currentTime.toLocaleString()}`))
    return
}




async function getLastPrice(stock_id) {
        const [priceResult, priceFields] = await db.query(`SELECT price, date FROM stockprices WHERE stock_id = ? ORDER BY date DESC LIMIT 1`, [stock_id])

        return {
            price: parseFloat(priceResult[0].price),
            date: new Date(priceResult[0].date)
        }
}

//$SCAM
async function getScamPrice(stock_id) {
    const { price } = await getLastPrice(stock_id);
    const currentPrice = price;
    let newScamPrice;
    if(currentPrice > 25)
    {
        newScamPrice = Math.random() < 0.1 ? 1 : Math.max(0, currentPrice + (Math.random() * 4 - 1))
    }    
    else
    {
        newScamPrice = Math.max(0,currentPrice  + (Math.random() * 4 - 1))
    }

    return parseFloat(newScamPrice.toFixed(2))
}

//$WC - chooses one at random
async function getRandomOne(stock_id) {
    const ChosenOne = Math.floor(Math.random() * (7-0+1) +0);
    let newPrice;
    switch (ChosenOne) {
        case 0:
            newPrice = getScamPrice(stock_id);
            break;
        case 1:
            newPrice = getd20Price(stock_id);
            break;
        case 2:
            newPrice = getNextPriceMomentum(stock_id);
            break;
        case 3:
            newPrice = getNextPriceRandomWalk(stock_id);
            break;
        case 4:
            newPrice = getNextPriceSeasonal(stock_id);
            break;
        case 5:
            newPrice = getNextPriceGBM(stock_id);
            break;
        case 6:
            newPrice = getNextPriceMeanReversion(stock_id)
            break;
        case 7:
            newPrice = getNextPriceRRT(stock_id);
            break;
    }

    return newPrice;
}


//$D20
async function getd20Price(stock_id) {
    const { price } = await getLastPrice(stock_id)
    const currentPrice = price; 
    let randomNumber = Math.floor(Math.random()*20) + 1;
    if(randomNumber == 20)
    {
        randomNumber = randomNumber + 3
        console.log(chalk.bgRed(`Rolled a Nat 20 :)`))
    }
    else if(randomNumber == 1)
    {
        randomNumber = randomNumber - 3
        console.log(chalk.bgRed(`Rolled a Nat 1 :(`))
    }
    else{
        console.log(chalk.red(`Rolled a ${randomNumber}`))
    }


    const newPrice = Math.max(1, currentPrice + (randomNumber - 12))
    return parseFloat(newPrice.toFixed(2))
    
}

//$SS
async function getNextPriceMomentum(stock_id) {
    const [latest, previous] = await Promise.all([
        db.query(`SELECT price FROM stockprices WHERE stock_id = ? ORDER BY date DESC LIMIT 1`, [stock_id]),
        db.query(`SELECT price FROM stockprices WHERE stock_id = ? ORDER BY date DESC LIMIT 1 OFFSET 1`, [stock_id])
    ]);

    
    const currentPrice = parseFloat(latest[0][0].price);
    const prevPrice = parseFloat(previous[0][0].price);
    
    if(Math.random()>0.1)
    {
        const momentum = currentPrice - prevPrice;
        const noise = (Math.random() * 2 - 1) * 0.01 * currentPrice;
        const nextPrice = Math.max(1, currentPrice + momentum * 0.5 + noise);

        return parseFloat(nextPrice.toFixed(2));
    }

    return parseFloat(currentPrice.toFixed(2)+1)
}

//$DAGS
async function getNextPriceRandomWalk(stock_id) {
    const { price } = await getLastPrice(stock_id);

    const volatility = 0.2; // 2% volatility
    const changePercent = (Math.random() * 2 - 1) * volatility;
    const nextPrice = Math.max(1,price * (1 + changePercent));

    return parseFloat(nextPrice.toFixed(2));
}

//$VFB
async function getNextPriceSeasonal(stock_id) {
    const { price, date } = await getLastPrice(stock_id);

    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    const seasonalFactor = Math.sin((2 * Math.PI * dayOfYear) / 365);
    const seasonalEffect = 0.3 * seasonalFactor * price;

    const noise = (Math.random() * 2 - 1) * 0.1 * price;
    const nextPrice = Math.max(1,price + seasonalEffect + noise);

    return parseFloat(nextPrice.toFixed(2));
}

//$PP
async function getNextPriceGBM(stock_id) {
    const { price } = await getLastPrice(stock_id);

    const drift = 0.0005; // expected return
    const volatility = 0.1;
    const dt = 1; // time step (1 day)
    const randomShock = volatility * Math.sqrt(dt) * (Math.random() * 2 - 1);

    const nextPrice = Math.max(1,price * Math.exp((drift - 0.5 * volatility ** 2) * dt + randomShock));

    return parseFloat(nextPrice.toFixed(2));
}

//$FWI
async function getNextPriceMeanReversion(stock_id) {
    const { price } = await getLastPrice(stock_id);
    const mean = 60

    const reversionStrength = 0.05; // how fast price returns to mean
    const noise = (Math.random() * (10+10+1) - 10) * 0.01 * mean;

    const nextPrice = Math.max(1,price + reversionStrength * (mean - price) + noise);

    return parseFloat(nextPrice.toFixed(2));
}

//$RRT
async function getNextPriceRRT(stock_id) {
    const {price} = await getLastPrice(stock_id);
    const nextPrice = Math.max(1,price-price * 0.02);

    return parseFloat(nextPrice.toFixed(2));
}