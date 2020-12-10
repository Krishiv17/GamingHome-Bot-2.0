const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const { url } = require('inspector');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
    if (message.content === '!fruits') {
        message.react('🍎');
        message.react('🍊');
        message.react('🍇');
    }
	
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.on('message', message => {
	if (message.channel.type != 'text' || message.author.bot)
		return;

	let command = message.content.split(' ')[0].slice(1);
	let args = message.content.replace('.' + command, '').trim();
	let isBotOwner = message.author.id == '' || '';

	switch (command) {
		case 'restart': {
			if (!isBotOwner)
				return;

			message.channel.send('Restarting...').then(m => {
				client.destroy().then(() => {
					client.login(token);
				});
			});
			break;
		}


		case 'shutdown': {
			if (!isBotOwner)
				return;

			message.channel.send('Shutting down...').then(m => {
				client.destroy();
			});
			break;
		}
	}
});


client.on("ready", () => {
    client.user.setPresence({
        status: "online",  //You can show online, idle....
        activity: {
            name: "!help.",  //The message shown
            type: "STREAMING", //PLAYING: WATCHING: LISTENING: STREAMING:
            url: "http://twitch.tv/dankmemer"
        }
    });
});

client.on("message", message => {
    switch(message.content.toLowerCase()) {
        case ("!massunban all"):
            if (message.member.hasPermission("ADMINISTRATOR")) {
                message.guild.fetchBans().then(bans => {
                    if (bans.size == 0) {message.reply("There are no banned users."); throw "No members to unban."};
                    bans.forEach(ban => {
                        message.guild.members.unban(ban.user.id);
                    });
                }).then(() => message.reply("Unbanned all users.")).catch(e => console.log(e))
            } else {message.reply("You do not have enough permissions for this command.")}
        break;
    }
});

client.login(token);