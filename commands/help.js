const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('List of commands'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
		.setColor("Red")
		.setTitle("List of Commands")
		.setAuthor({ name: "Extra Hearts", url: "https://extraheartsguild.webnode.com/", iconURL: "https://cdn.discordapp.com/avatars/1106906856334565387/4f334cd265a071ea19cd83b42127f782.webp?size=256"})
		.setFooter({text: "Bot made by @idkdom", iconURL: "https://cdn.discordapp.com/avatars/1101610763057102929/4dfb55a51e44eea78b6e6259e7b98578.webp?size=160"})
		.addFields(
			{name: "/help", value: "This menu right here"},
			{name: "/info", value: "Displays general info about the bot"},
			{name: "/lb", value: "Displays a leaderboard of guild credits!\n`username` *optional* Jumps to a specific player in lb"},
			{name: "/member", value: "Displays guild member info \n`username` **required**"},
			);
		await interaction.reply({ embeds: [embed] });
	},
};