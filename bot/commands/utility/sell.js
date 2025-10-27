const {SlashCommandBuilder, EmbedBuilder} = require('discord.js')
const {createStockChoices, createTransactionRequest} = require('../../utils')


module.exports = {
    data: new SlashCommandBuilder()
    .setName('sell')
        .setDescription('sell the stock you want')
        .addStringOption(option => 
            option.setName("ticker")
            .setDescription("Ticker of the stock you want to sell")
            .setRequired(true)
            .addChoices(createStockChoices())
        )
        .addIntegerOption(option =>
            option.setName("amount")
            .setDescription("Ammount to sell")
            .setRequired(true)
            .setMinValue(1)
        ),
    async execute(interaction){
        const user_id = interaction.user.id;
        const stock_id = interaction.options.getString('ticker')
        const type = 'SELL'
        const quantity = interaction.options.getInteger('amount')
        const react = await fetch(`http://localhost:${process.env.API_PORT}/transaction`,createTransactionRequest(user_id,stock_id, type, quantity))
        const data = await react.json()
        const messageUndone = data.message
        if(messageUndone != 'Transaction Complete!')
        {
            interaction.reply(`You do not have enough stocks to complete the transaction`)
            return
        }
        const embed = new EmbedBuilder()
        .setTitle(messageUndone)
        .setDescription(`${interaction.user.globalName}`)
        .setFields({name: `${quantity} stocks`, value: `${stock_id} sold for ${data.total} gp total`})
        .setColor(0xfc0303)
        
        await interaction.reply({embeds: [embed]})
    },
};