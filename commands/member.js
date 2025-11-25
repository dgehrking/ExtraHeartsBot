const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const Hypixel = require("hypixel-api-reborn");
const Credits = require("../models/credits");
const hypixelclient = require("../index.js");
const hypixel = hypixelclient.hypixel;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("member")
        .setDescription("Gets information about a guild member")
        .addStringOption((option) =>
            option
                .setName("username")
                .setDescription("Specify the username of a guild member")
                .setRequired(true)
        ),
    async execute(interaction) {
        const uuid = await getUUID(interaction.options.getString("username"));
        let guild;
        try {
            guild = await hypixel.getGuild("player", uuid);
        } catch (error) {
            console.log(error);
            return;
        }
        let output = await fetchName(uuid);
        try {
            const credit = await Credits.create({
                uuid: uuid,
                ign: output,
            });
        } catch (error) {
            if (error.name === "SequelizeUniqueConstraintError") {
                console.log("Duplicate UUID! Skipping...");
            } else {
                console.error(error);
            }
        }
        let member = await Credits.findOne({ where: { uuid: uuid } });
        if (
            interaction.options.getString("username").toLowerCase() !=
            member.ign.toString().toLowerCase()
        ) {
            const newign = await fetchName(uuid);
            member = await Credits.update(
                { ign: newign.toString() },
                { where: { uuid: uuid } }
            );
        }
        if (guild.id == "56f57c560cf2ca52c425f79e") {
            if (guild.me.rank.toString() != member.rank.toString()) {
                member = await Credits.update(
                    { rank: guild.me.rank.toString() },
                    { where: { uuid: uuid } }
                );
            }
        }

        member = await Credits.findOne({ where: { uuid: uuid } });

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Extra Hearts Bot")
            .setAuthor({
                name: "Extra Hearts",
                url: "https://extraheartsguild.webnode.com/",
                iconURL:
                    "https://cdn.discordapp.com/avatars/1106906856334565387/4f334cd265a071ea19cd83b42127f782.webp?size=256",
            })
            .addFields(
                { name: "Username", value: member.ign.toString() },
                { name: "Guild Rank", value: member.rank.toString() },
                { name: "Guild Credits", value: member.credits.toString() }
            )
            .setFooter({
                text: "Bot made by @idkdom",
                iconURL:
                    "https://cdn.discordapp.com/avatars/1101610763057102929/4dfb55a51e44eea78b6e6259e7b98578.webp?size=160",
            });
        await interaction.reply({ embeds: [embed] });
    },
};

async function getUUID(playername) {
    return await fetch(
        `https://api.mojang.com/users/profiles/minecraft/${playername}`
    )
        .then((data) => data.json())
        .then((player) => player.id);
}

function fetchName(uuid) {
    return new Promise(async (resolve, reject) => {
        const response = await fetch(
            "https://sessionserver.mojang.com/session/minecraft/profile/" + uuid
        );
        const json = await response.json();
        const name = await json.name;
        resolve(name);
    });
}
