const {SlashCommandBuilder, AttachmentBuilder, EmbedBuilder} = require('discord.js');
const { createStockChoicesAll } = require('../../utils');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('view')
    .setDescription('View a singe stocks historic performance, or put in all for all!')
    .addStringOption(option => 
            option.setName("ticker")
            .setDescription("Ticker of the stock you want to view, use all to view all")
            .setRequired(true)
            .addChoices(createStockChoicesAll())
    ),
    async execute(interaction) {
        if(interaction.options.getString('ticker') != 'all')
        {
            const response = await fetch(`http://localhost:${process.env.API_PORT}/stocks/${interaction.options.getString('ticker')}`)
            const data = await response.json()
            const file = new AttachmentBuilder(`../api/public/${data.imageUrl}`)
            const imageSlug = data.imageUrl.split('/')[2]

            const user_id = interaction.user.id;
            const r2 = await fetch(`http://localhost:${process.env.API_PORT}/users/${user_id}`)
            const d2 = await r2.json()
            const wallet = d2.body.wallet

            const canBuy = Math.floor(wallet / data.latestPrice)

            const stockTotal = d2.body.stocks.find(element => element.symbol == interaction.options.getString('ticker'))
            let quantity = 0;
            if(stockTotal == null|stockTotal == undefined)
            {
                quantity = 0
            }
            else
            {
                quantity = stockTotal.quantity
            }


            const embed = new EmbedBuilder()
            .setTitle(`${data.name}   -   ${interaction.options.getString('ticker')}`)
            .setDescription(`${data.description}`)
            .setImage(`attachment://${imageSlug}`)
            .setFields(
                {name: 'Latest Price', value: `${data.latestPrice} gp`, inline: true},
                {name: 'Last Movement', value: `${data.lastMovement>=0 ? '↗️' : '↘️'}\n ${data.lastMovement>=0 ? '+' :''} ${data.lastMovement} gp`, inline: true},
                {name: 'You can buy:', value: `${canBuy} Stocks`, inline: true },
                {name: 'You can sell:', value: `${quantity} Stocks for a total of ${quantity * data.latestPrice} gp`, inline: true}
            ).setColor(data.lastMovement>=0 ? 0x03fc20 : 0xfc0303 )
            
            await interaction.reply({embeds: [embed], files: [file]})
            return
        }
        else
        {
            const response = await fetch(`http://localhost:${process.env.API_PORT}/stocks`)
            const data = await response.json()
            const imageSlug = data.imageUrl.split('/')[2]

            stockTicker = []; latestPrice = []; lastMovement = [];
            data.data.forEach(stock => {
                stockTicker.push(stock.symbol);
                latestPrice.push(`${stock.prices[stock.prices.length -1]} gp`);
                const lsMv = stock.prices[stock.prices.length -1] - stock.prices[stock.prices.length-2];
                lastMovement.push(`${lsMv >= 0 ? '📈' : '📉'} ${lsMv >= 0 ? '+' : ''}${lsMv} gp`);
            });

            const attachment = new AttachmentBuilder(`../api/public${data.imageUrl}`)

            const embed = new EmbedBuilder()
            .setTitle('All Stocks Overview')
            .addFields(
                { name: 'Ticker', value: stockTicker.join('\n'), inline: true },
                { name: 'Latest Price', value: latestPrice.join('\n'), inline: true },
                { name: 'Last Movement', value: lastMovement.join('\n'), inline: true }
            )
            .setColor(0x0099ff)
            .setImage(`attachment://${imageSlug}`);
            await interaction.reply({ embeds: [embed], files: [attachment] });

        }

    }
}