const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType,
} = require("discord.js");
const fetch = require("node-fetch");
const Credits = require("../models/credits");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lb")
        .setDescription("Displays leaderboard for guild credits")
        .addStringOption((option) =>
            option
                .setName("username")
                .setDescription("Jump to a specific guild member")
                .setRequired(false)
        ),
    async execute(interaction) {
        let embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Guild Credits Leaderboard")
            .setAuthor({
                name: "Extra Hearts",
                url: "https://extrahearsguild.webnode.com/",
                iconURL:
                    "https://cdn.discordapp.com/avatars/1106906856334565387/4f334cd265a071ea19cd83b42127f782.webp?size=256",
            })
            .setFooter({
                text: "Bot made by @idkdom",
                iconURL:
                    "https://cdn.discordapp.com/avatars/1101610763057102929/4dfb55a51e44eea78b6e6259e7b98578.webp?size=160",
            });
        const orderedMembers = await Credits.findAll({
            order: [["credits", "DESC"]],
        });
        let maxIndex = orderedMembers.length;
        let startIndex = 0;
        if (interaction.options.getString("username") !== null) {
            const uuid = await getUUID(
                interaction.options.getString("username")
            );
            for (let i = 0; i < orderedMembers.length; i++) {
                if (orderedMembers[i].uuid == uuid) {
                    startIndex = i;
                    break;
                }
            }
        }
        startIndex = Math.floor(startIndex / 10) * 10;
        for (let i = startIndex; i < startIndex + 10; i++) {
            let rank;
            if (orderedMembers[i] === undefined) {
                break;
            }
            if (orderedMembers[i].rank == "GUILDMASTER") {
                rank = "[GM]";
            } else if (orderedMembers[i].rank == "STAFF") {
                rank = "[STAFF]";
            } else if (orderedMembers[i].rank == "General") {
                rank = "[IV]";
            } else if (orderedMembers[i].rank == "Sergeant") {
                rank = "[III]";
            } else if (orderedMembers[i].rank == "Private") {
                rank = "[II]";
            } else if (orderedMembers[i].rank == "Rookie") {
                rank = "[I]";
            }
            if (i > maxIndex) {
                embed.addFields({
                    name: "N/A",
                    value: "N/A Guild Credits",
                    inline: true,
                });
            }
            embed.addFields({
                name: `#${i + 1} ${rank} ${orderedMembers[i].ign}`,
                value: orderedMembers[i].credits + " Guild Credits",
                inline: true,
            });
            if (i % 2 == 1) {
                embed.addFields({ name: " ", value: " ", inline: true });
            }
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("first")
                .setLabel("<<")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(startIndex < 10),
            new ButtonBuilder()
                .setCustomId("back")
                .setLabel("<")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(startIndex < 10),
            new ButtonBuilder()
                .setCustomId("next")
                .setLabel(">")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(startIndex + 10 > maxIndex),
            new ButtonBuilder()
                .setCustomId("last")
                .setLabel(">>")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(startIndex + 10 > maxIndex)
        );

        const response = await interaction.reply({
            embeds: [embed],
            components: [row],
        });
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000,
        });
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        collector.on("collect", async (buttonPress) => {
            if (buttonPress.user.id === interaction.user.id) {
                if (buttonPress.customId === "first") {
                    startIndex = 0;
                } else if (buttonPress.customId === "back") {
                    if (startIndex >= 10) {
                        startIndex -= 10;
                    }
                } else if (buttonPress.customId === "next") {
                    if (startIndex < maxIndex) {
                        startIndex += 10;
                    }
                } else if (buttonPress.customId === "last") {
                    if (startIndex < Math.floor((maxIndex - 10) / 10) * 10) {
                        startIndex = maxIndex;
                    }
                }

                embed = await updateEmbed(startIndex);
                const newRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("first")
                        .setLabel("<<")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(startIndex < 10),
                    new ButtonBuilder()
                        .setCustomId("back")
                        .setLabel("<")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(startIndex < 10),
                    new ButtonBuilder()
                        .setCustomId("next")
                        .setLabel(">")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(startIndex + 10 > maxIndex),
                    new ButtonBuilder()
                        .setCustomId("last")
                        .setLabel(">>")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(startIndex + 10 > maxIndex)
                );
                await buttonPress.update({
                    embeds: [embed],
                    components: [newRow],
                });
                collector.resetTimer();
            } else {
                buttonPress.reply({
                    content: `These buttons aren't for you!`,
                    ephemeral: true,
                });
            }
        });

        collector.on("end", async () => {
            interaction
                .editReply({ embeds: [embed], components: [] })
                .catch((error) => {
                    console.log(error);
                });
        });
    },
};

async function updateEmbed(start) {
    let startIndex = start;
    let embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Guild Credits Leaderboard")
        .setAuthor({
            name: "Extra Hearts",
            url: "https://extraheartsguild.webnode.com/",
            iconURL:
                "https://cdn.discordapp.com/avatars/1106906856334565387/4f334cd265a071ea19cd83b42127f782.webp?size=256",
        })
        .setFooter({
            text: "Bot made by @idkdom",
            iconURL:
                "https://cdn.discordapp.com/avatars/1101610763057102929/4dfb55a51e44eea78b6e6259e7b98578.webp?size=160",
        });
    const orderedMembers = await Credits.findAll({
        order: [["credits", "DESC"]],
    });
    startIndex = Math.floor(startIndex / 10) * 10;
    for (let i = startIndex; i < startIndex + 10; i++) {
        let rank;
        if (orderedMembers[i] === undefined) {
            break;
        }
        if (orderedMembers[i].rank == "GUILDMASTER") {
            rank = "[GM]";
        } else if (orderedMembers[i].rank == "STAFF") {
            rank = "[STAFF]";
        } else if (orderedMembers[i].rank == "General") {
            rank = "[IV]";
        } else if (orderedMembers[i].rank == "Sergeant") {
            rank = "[III]";
        } else if (orderedMembers[i].rank == "Private") {
            rank = "[II]";
        } else if (orderedMembers[i].rank == "Rookie") {
            rank = "[I]";
        }
        if (i > orderedMembers.length) {
            embed.addFields({
                name: "N/A",
                value: "N/A Guild Credits",
                inline: true,
            });
        }
        embed.addFields({
            name: `#${i + 1} ${rank} ${orderedMembers[i].ign}`,
            value: orderedMembers[i].credits + " Guild Credits",
            inline: true,
        });
        if (i % 2 == 1) {
            embed.addFields({ name: " ", value: " ", inline: true });
        }
    }
    return embed;
}

async function getUUID(playername) {
    return await fetch(
        `https://api.mojang.com/users/profiles/minecraft/${playername}`
    )
        .then((data) => data.json())
        .then((player) => player.id);
}
