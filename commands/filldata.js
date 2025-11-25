const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fetch = require("node-fetch");
const Credits = require('../models/credits');
const hypixelclient = require('../index.js');
const hypixel = hypixelclient.hypixel;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('filldata')
		.setDescription('Fill database with guild information')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	async execute(interaction) {
        let guild;
        try {
	        guild = await hypixel.getGuild("name", "ExtraHearts");
        } catch (error) {
    	console.log(error);
	    return;
        }
        const members = guild.members;
        const memberUUIDs = members.map(member => member.uuid);
        const mojangResponses = await Promise.allSettled(memberUUIDs.map(uuid => fetchName(uuid)));

        for (let i = 0; i < members.length; i++) {
            try {    
                const credit = await Credits.create( {
                    rank: members[i].rank,
                    uuid: memberUUIDs[i],
                    ign: mojangResponses[i].value.toString(),
                })
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {console.log("Duplicate UUID! Skipping...")} else {
                    console.error(error);
                }
            }    
        }
		const embed = new EmbedBuilder()
		.setColor("Red")
		.setTitle("Users added to database")
		.setAuthor({ name: "Extra Hearts", url: "https://extraheartsguild.webnode.com/", iconURL: "https://cdn.discordapp.com/avatars/1106906856334565387/4f334cd265a071ea19cd83b42127f782.webp?size=256"})
		.setFooter({text: "Bot made by @idkdom", iconURL: "https://cdn.discordapp.com/avatars/1101610763057102929/4dfb55a51e44eea78b6e6259e7b98578.webp?size=160"});
		await interaction.reply({ embeds: [embed] });
	},
};

function fetchName(uuid) {
    return new Promise(async (resolve, reject) => {
        const response = await fetch("https://sessionserver.mojang.com/session/minecraft/profile/" + uuid);
        const json = await response.json();
        const name = await json.name;
        resolve(name);
    });
}
