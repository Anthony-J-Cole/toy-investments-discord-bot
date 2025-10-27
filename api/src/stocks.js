import chalk from "chalk";
import db from "../db.js";
import {stockIdFromTicker} from './transactions.js'
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'fs';
import path from 'path';
import { plugins } from "chart.js";
import { text } from "stream/consumers";

export async function getStockPrice(request, response) {
    console.log(chalk.bgBlue(`Starting price get...`))
    const sql = `SELECT stockprices.price
FROM stocks
INNER JOIN stockprices ON stocks.stock_id = stockprices.stock_id
WHERE stocks.symbol = ?
ORDER BY stockprices.date DESC
LIMIT 1;`
    const [result, fields] = await db.query(sql,[request.params.id])
    response.status(200).send({message: `OK`,body:result[0],headers:{"Content-Type": "application/json"}})
}

export async function getPriceHistory(request, response) {
    console.log(chalk.bgMagenta(`Starting price history get...`))
    const stock_id = await stockIdFromTicker(request.params.id)
    const sql = `SELECT stockprices.date, stockprices.price, stocks.name, stocks.description 
FROM stockprices
INNER JOIN stocks ON stockprices.stock_id = stocks.stock_id
WHERE stockprices.stock_id = ?`
    const [priceResult, priceFields] = await db.query(sql, [stock_id])

    //Unwrap priceResult
    //then make that into a graph using chart.js
    // Unwrap priceResult
    const labels = priceResult.map(row => {
        const dateStr = row.date.toISOString().split('T')[0]; // "YYYY-MM-DD"
        return dateStr;
    });
    const data = priceResult.map(row => row.price);
    const stockName = priceResult[0].name
    const stockDescription = priceResult[0].description

    // Generate chart using chart.js and chartjs-node-canvas
    const width = 800; // px
    const height = 400; // px
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    const configuration = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Price History',
                data: data,
                borderColor: 'rgba(75,192,192,1)',
                fill: false,
                segment: {
                        borderColor: (ctx) => ctx.p0.parsed.y > ctx.p1.parsed.y ? 'red' : 'green'
                    }
            }]
        },
        options: {
            scales: {
                x: { display: true, title: { display: true, text: 'Date' } },
                y: { display: true, title: { display: true, text: 'Price' } }
            },
            plugins: {
                title: {
                    text: `${stockName}`
                } 
            }
        }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

    // Save image to disk (e.g., in a public/images directory)
    const imageName = `price-history-${request.params.id}.png`;
    const imagePath = path.join(process.cwd(), 'public', 'images', imageName);
    fs.writeFileSync(imagePath, imageBuffer);

    // then send the location of the image as a response
    response.status(200).send({
        message: 'OK',
        name: `${stockName}`,
        description: `${stockDescription}`,
        latestPrice: `${data[data.length-1]}`,
        lastMovement: `${data[data.length -1] - data[data.length-2]}`,
        imageUrl: `/images/${imageName}`,
        headers: { "Content-Type": "application/json" }
    });
}

export async function getAllStocks(request, response) {
    const sql = `SELECT stockprices.date, stockprices.price, stocks.name, stocks.description, stocks.symbol
FROM stockprices
INNER JOIN stocks ON stockprices.stock_id = stocks.stock_id`
    const [priceResult, priceFields] = await db.query(sql, [])
    //Put all of the priceResults into a chart using chart.js like above
    const stocksMap = new Map();
    priceResult.forEach(row => {
        if (!stocksMap.has(row.name)) {
            stocksMap.set(row.name, {
                name: row.name,
                description: row.description,
                dates: [],
                prices: [],
                symbol: row.symbol
            });
        }
        stocksMap.get(row.name).dates.push(row.date.toISOString().split('T')[0]);
        stocksMap.get(row.name).prices.push(row.price);
    });

    const width = 800;
    const height = 400;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    // Define a static array of colors for consistent stock coloring
    const staticColors = [
        '#006400', // red
        '#bc8f8f', // blue
        '#ffd700', // yellow
        '#00ff00', // teal
        '#00ffff', // purple
        '#a020f0', // orange
        '#1e90ff', // gray
        '#ff1493', // green
        '#ff4500'  // deep orange
    ];
    const datasets = Array.from(stocksMap.values()).map((stock, idx) => ({
        label: stock.name,
        data: stock.prices,
        fill: false,
        borderColor: staticColors[idx % staticColors.length]
    }));
    const labels = Array.from(new Set(priceResult.map(row => row.date.toLocaleString().split(', ')[1])))

    const configuration = {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            scales: {
                x: { display: true, title: { display: true, text: 'Date' } },
                y: { display: true, title: { display: true, text: 'Price' } }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'All Stocks Price History'
                }
            }
        }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

    const imageName = `all-stocks-history.png`;
    const imagePath = path.join(process.cwd(), 'public', 'images', imageName);
    fs.writeFileSync(imagePath, imageBuffer);

    response.status(200).send({
        message: 'OK',
        data: Array.from(stocksMap.values()).map(stock => ({
            name: stock.name,
            description: stock.description,
            dates: stock.dates,
            prices: stock.prices,
            symbol: stock.symbol
        })),
        imageUrl: `/images/${imageName}`,
        headers: { "Content-Type": "application/json" }
    });
}