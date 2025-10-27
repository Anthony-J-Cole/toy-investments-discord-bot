const {SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { execute } = require('./view')

module.exports = {

    data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription('View the leaderboard if everything was sold right now'),
    async execute(interaction) {
        const response = await fetch(`http://localhost:${process.env.API_PORT}/leaderboard`,
            {method: 'GET'});
        const data = await response.json()
        
        
        await interaction.reply(data != null? "Leaderboard here soon": "No leaderboard")
    }
}