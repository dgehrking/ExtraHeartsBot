const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Shows general information about the bot'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
		.setColor("Red")
		.setTitle("Extra Hearts Bot")
		.setDescription("A discord bot made to make managing the Extra Hearts guild a breeze!")
		.setAuthor({ name: "Extra Hearts", url: "https://extraheartsguild.webnode.com/", iconURL: "https://cdn.discordapp.com/avatars/1106906856334565387/4f334cd265a071ea19cd83b42127f782.webp?size=256"})
		.addFields(
			{name: 'What is this?', value: 'Extra Hearts is a guild on the Hypixel server that strives to hold a welcoming community for everyone who just enjoys playing Hypixel. This bot is designed for the use of anyone in or related to the guild.'},
			{name: 'This is a WORK IN PROGRESS', value: 'Any suggestions? Message @idkdom'},
		)
		.setFooter({text: "Bot made by @idkdom", iconURL: "https://cdn.discordapp.com/avatars/1101610763057102929/4dfb55a51e44eea78b6e6259e7b98578.webp?size=160"});
		await interaction.reply({ embeds: [embed] });
	},
}