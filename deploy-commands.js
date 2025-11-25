require("dotenv").config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');

const commandFiles = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
const commands = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());	
	} else {
		console.log(`[WARNING] a command is missing a required "data" or "execute" property.`);
	}
}

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// Catch and log any errors!
		console.error(error);
	}
})();