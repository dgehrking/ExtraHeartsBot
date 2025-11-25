const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Credits = require('../models/credits');
const fetch = require("node-fetch");
const Hypixel = require("hypixel-api-reborn");
const hypixelclient = require('../index.js');
const hypixel = hypixelclient.hypixel;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removeinactive')
		.setDescription('Deletes any members who have no guild credits and are not in the guild from the database.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	async execute(interaction) {
        try {
            guild = await hypixel.getGuild("name", "ExtraHearts");
        } catch (error) {
            console.log(error);
            return;
        }
        let currMembers = guild.members;
        let currMembersIDs = currMembers.map(m => m.uuid);
        let dataBaseIds = await Credits.findAll( {
            raw: true,
            attributes: ['uuid'],
        });
        const usersToRemove = dataBaseIds.filter(user => !currMembersIDs.includes(user.uuid));
        for (const user of usersToRemove) {
            await Credits.destroy({ where: {uuid: user.uuid}});
        }
		const embed = new EmbedBuilder()
		.setColor("Red")
		.setTitle("Success!")
		.setAuthor({ name: "Extra Hearts", url: "https://extraheartsguild.webnode.com/", iconURL: "https://cdn.discordapp.com/avatars/1106906856334565387/4f334cd265a071ea19cd83b42127f782.webp?size=256"})
		.setFooter({text: "Bot made by @idkdom", iconURL: "https://cdn.discordapp.com/avatars/1101610763057102929/4dfb55a51e44eea78b6e6259e7b98578.webp?size=160"});
		await interaction.reply({ embeds: [embed] });
	},
};
