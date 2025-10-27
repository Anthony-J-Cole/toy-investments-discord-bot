const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('adduser')
    .setDescription('Add yourself to the database')
    .addStringOption(option => 
        option.setName("name")
        .setDescription("Add name in the database! Otherwise changes it")
        .setRequired(true)
    ),
    async execute(interaction){
        const data = {
                    user_id: `${interaction.user.id}`,
                    name: `${interaction.options.getString('name')}`
                };
        const send = {
                method:'POST',
                body: JSON.stringify(data),
                headers: {"Content-Type": "application/json"}
            }
        const response = await fetch(`http://localhost:${process.env.API_PORT}/users`,send);
        const newData = await response.json()
        await interaction.reply(`${newData.message}`)
    } 
}