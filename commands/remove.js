const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Credits = require('../models/credits');
const fetch = require("node-fetch");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Deletes a user from the database')
		.addStringOption(option => 
			option.setName('username')
			.setDescription('Specify the username of a guild member')
			.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	async execute(interaction) {
		const uuid = await getUUID(interaction.options.getString('username'));
		const member = await Credits.destroy({ where: {uuid: uuid} });
		const embed = new EmbedBuilder()
		.setColor("Red")
		.setTitle("Success!")
		.setAuthor({ name: "Extra Hearts", url: "https://extraheartsguild.webnode.com/", iconURL: "https://cdn.discordapp.com/avatars/1106906856334565387/4f334cd265a071ea19cd83b42127f782.webp?size=256"})
		.setFooter({text: "Bot made by @idkdom", iconURL: "https://cdn.discordapp.com/avatars/1101610763057102929/4dfb55a51e44eea78b6e6259e7b98578.webp?size=160"});
		await interaction.reply({ embeds: [embed] });
	},
};

async function getUUID(playername) {
	return await fetch(`https://api.mojang.com/users/profiles/minecraft/${playername}`)
    .then(data => data.json())
    .then(player => player.id);
}