require("dotenv").config();
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const Hypixel = require("hypixel-api-reborn");
const Sequelize = require('sequelize');
const fetch = require("node-fetch");
const fs = require("fs");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const hypixel = new Hypixel.Client(process.env.API_KEY);
module.exports = { hypixel };
const Credits = require("./models/credits.js");
let prevMembers;

//initialize commands
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);	
	} else {
		console.log(`[WARNING] a command is missing a required "data" or "execute" property.`);
	}	
}

client.once("ready", () => {
	client.user.setActivity("over the guild", { type: "Watching" });
	Credits.sync();
	console.log("Bot is Online!");
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

async function sendGuildCredits() {
const date  = new Date();
const today = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + (date.getDate());
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

	//Sort members by daily gexp and get their names
    for (let i = 0; i < members.length; i++) {
        const name = mojangResponses[i]?.value?.name ?? 'ERROR';    
        members[i].name = name;
        members[i].dailyGexp = Object.values(members[i].expHistory)[1].exp;
    }

    members.sort((a, b) => b.dailyGexp - a.dailyGexp);
    //Grab top 10 and add credits to database
	for (const member of members.slice(0, 10)) {
		const guildMember = await Credits.findOne({ where: {uuid: member.uuid} });
		const baseCredits = guildMember.credits;
		const dataUpdate = await Credits.update({ credits: baseCredits + Math.floor(member.dailyGexp / 10000)}, { where: { uuid: member.uuid} });
    }

	//Send embed for top 10 gexp
	const gexpEmbed = new EmbedBuilder()
	.setTitle("Guild Credits Earned for " + today)
	.setColor("Red")
	.addFields(
		{name: members[0].name, value: Math.floor(members[0].dailyGexp / 10000) + " Guild Credits"},
		{name: members[1].name, value: Math.floor(members[1].dailyGexp / 10000) + " Guild Credits"},
		{name: members[2].name, value: Math.floor(members[2].dailyGexp / 10000) + " Guild Credits"},
		{name: members[3].name, value: Math.floor(members[3].dailyGexp / 10000) + " Guild Credits"},
		{name: members[4].name, value: Math.floor(members[4].dailyGexp / 10000) + " Guild Credits"},
		{name: members[5].name, value: Math.floor(members[5].dailyGexp / 10000) + " Guild Credits"},
		{name: members[6].name, value: Math.floor(members[6].dailyGexp / 10000) + " Guild Credits"},
		{name: members[7].name, value: Math.floor(members[7].dailyGexp / 10000) + " Guild Credits"},
		{name: members[8].name, value: Math.floor(members[8].dailyGexp / 10000) + " Guild Credits"},
		{name: members[9].name, value: Math.floor(members[9].dailyGexp / 10000) + " Guild Credits"},
	)
	.setFooter({text: "Bot made by @idkdom", iconURL: "https://cdn.discordapp.com/avatars/1101610763057102929/4dfb55a51e44eea78b6e6259e7b98578.webp?size=160"});
	client.channels.cache.get("904781428301119508").send({ embeds: [gexpEmbed] });

    async function fetchName(uuid) {
        return new Promise(async (resolve, reject) => {
            const response = await fetch("https://sessionserver.mojang.com/session/minecraft/profile/" + uuid);
            const json = await response.json();
            resolve(json);
        });
    }
}

async function getUUID(playername) {
	return await fetch(`https://api.mojang.com/users/profiles/minecraft/${playername}`)
    .then(data => data.json())
    .then(player => player.id);
}

client.login(process.env.BOT_TOKEN);

setInterval(async function() {
	try {
		guild = await hypixel.getGuild("name", "ExtraHearts");
	} catch (error) {
		console.log(error);
		return;
	}

	let date = new Date();
	check();

	async function check() {
		const date  = new Date();
		const today = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
		let currMembers = guild.members;
		if (!prevMembers) {
			prevMembers = currMembers;
			return;
		}

		const prevMembersIDs = prevMembers.map(m => m.uuid);
		const currMembersIDs = currMembers.map(m => m.uuid);

		const newMembers = currMembers.filter(member =>
			!prevMembersIDs.includes(member.uuid));
		const leftMembers = prevMembers.filter(member =>
			!currMembersIDs.includes(member.uuid));

			function fetchName(uuid) {
				return new Promise(async (resolve, reject) => {
					const response = await fetch("https://sessionserver.mojang.com/session/minecraft/profile/" + uuid);
					const json = await response.json();
					const name = json.name;
					resolve(name);
				});
			}

		if (newMembers.length > 0) {
			let newMember = new EmbedBuilder()
			.setColor("Green")
			.setAuthor({ name: "Extra Hearts", url: "https://extraheartsguild.webnode.com/", iconURL: "https://cdn.discordapp.com/avatars/1106906856334565387/4f334cd265a071ea19cd83b42127f782.webp?size=256"})
			.setFooter({text: "Bot made by @idkdom", iconURL: "https://cdn.discordapp.com/avatars/1101610763057102929/4dfb55a51e44eea78b6e6259e7b98578.webp?size=160"});
			if (newMembers.length > 1) {
				newMember.setTitle("Members Joined!");
			} else {
				newMember.setTitle("Member Joined!");
			}
			for (let i = 0; i < newMembers.length; i++) {
				let output = await fetchName(newMembers[i]);
				newMember.addFields({name: today, value: output});
				try {
					const credit = await Credits.create({
						uuid: newMembers[i].toString(),
						ign: output
					})
				} catch(error) {
					if (error.name === 'SequelizeUniqueConstraintError') {console.log("Duplicate UUID! Skipping...")} else {
						console.error(error);
					}
				}
			}
			client.channels.cache.get("964562662371500112").send({ embeds: [newMember] });
		}
		if (leftMembers.length > 0) {
			let leftMember = new EmbedBuilder()
			.setColor("Red")
			.setAuthor({ name: "Extra Hearts", url: "https://extraheartsguild.webnode.com/", iconURL: "https://cdn.discordapp.com/avatars/1106906856334565387/4f334cd265a071ea19cd83b42127f782.webp?size=256"})
			.setFooter({text: "Bot made by @idkdom", iconURL: "https://cdn.discordapp.com/avatars/1101610763057102929/4dfb55a51e44eea78b6e6259e7b98578.webp?size=160"});
			if (leftMembers.length > 1) {
				leftMember.setTitle("Members Left!");
			} else {
				leftMember.setTitle("Member Left!");
			}
			for (let i = 0; i < leftMembers.length; i++) {
				let output = await fetchName(leftMembers[i]);
				leftMember.addFields({name: today, value: output});
			}
			client.channels.cache.get("964562662371500112").send({ embeds: [leftMember] });
		}
		prevMembers = currMembers;
	}

	if(date.getHours() ===23 && date.getMinutes() === 15) {
		sendGuildCredits();
	}
}, 60000);