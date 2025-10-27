const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('summary')
    .setDescription('Show Profile Summary')
    .addUserOption(option =>
        option.setName("name")
        .setDescription(`Optional, the name of the user whos summary you want, leave blank for your own`)
        .setRequired(false)
    )
    ,
    async execute(interaction){
        let user_id = interaction.user.id;
        if(interaction.options.getUser('name') != null)
        {
            if(interaction.options.getUser('name').id == 170261072815718400)
            {
                interaction.reply("Uss Kobalds dont give away our secrets that easily - Chief Sootscale")
                return;
            }

            user_id = interaction.options.getUser('name').id;
        }
        const response = await fetch(`http://localhost:${process.env.API_PORT}/users/${user_id}`)
        const data = await response.json();

        if(data.error == 'User not found or no holdings')
        {
            interaction.reply("Oops, that user was not found in the database!")
            return;
        }
        const name = data.body.name;
        const wallet = data.body.wallet;
        const stocks = data.body.stocks;
        
        let ticker = [], quantity = [], currentPrice = []; currentTotal = [];
        if(stocks == null)
        {
            interaction.reply(`${interaction.user.globalName} please buy at least 1 stock to view summary`)
            return;
        }
        stocks.forEach(element => {
            if(element.quantity > 0)
            {
                ticker.push(element.symbol);
                quantity.push(element.quantity);
                currentPrice.push(element.price);
                currentTotal.push(element.quantity * element.price)
            }
        });

        const embed = new EmbedBuilder()
        .setTitle(name)
        .setColor(0x037bfc)
        .setDescription(`Wallet: ${wallet} gp`)
        .setFields(
            {name: 'Ticker', value: `${ticker.join('\n')}`, inline: true },
            {name: 'Quantity', value: `${quantity.join('\n')}`, inline: true },
            {name: 'Current Price', value: `${currentPrice.join(' gp\n')} gp`, inline: true },
            {name: 'Ticker', value: `${ticker.join('\n')}`, inline: true },
            {name: 'Current Total', value: `${currentTotal.join(' gp\n')} gp`, inline: true}    
        )
        await interaction.reply({embeds: [embed]})
    }
}