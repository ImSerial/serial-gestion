const Discord = require('discord.js')
const client = new Discord.Client({
	fetchAllMembers: true,
	partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_PRESENCES', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'],
	intents: [
		Discord.Intents.FLAGS.DIRECT_MESSAGES,
		Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
		Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING,
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_BANS,
		Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
		Discord.Intents.FLAGS.GUILD_INVITES,
		Discord.Intents.FLAGS.GUILD_MEMBERS,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
		Discord.Intents.FLAGS.GUILD_PRESENCES,
		Discord.Intents.FLAGS.GUILD_VOICE_STATES,
		Discord.Intents.FLAGS.GUILD_WEBHOOKS,
	]
})
const {
	readdirSync
} = require("fs")
const db = require('quick.db')
const ms = require("ms")
const {
	MessageEmbed
} = require('discord.js')
const {
	login
} = require("./util/login.js");
login(client)
process.on("unhandledRejection", err => {
	if (err.message) return
	console.error("Uncaught Promise Error: ", err);
})
const loadCommands = (dir = "./commands/") => {
	readdirSync(dir).forEach(dirs => {
		const commands = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));

		for (const file of commands) {
			const getFileName = require(`${dir}/${dirs}/${file}`);
			client.commands.set(getFileName.name, getFileName);
			console.log(`> Commande Charger ${getFileName.name} [${dirs}]`)
		};
	});
};

const channelFilter = require("./util/channelFilter.js");

client.on("message", async (message) => {
    if (channelFilter(message)) return; // Ignore les salons incompatibles

    // Le reste de ton traitement de commande
});

const voiceMuteLogs = require("./events/logs/voiceMuteLogs.js");

client.on("voiceStateUpdate", (oldState, newState) => {
    voiceMuteLogs(client, oldState, newState);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    require('./events/logs/roleUpdate.js')(client, oldMember, newMember);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    require('./events/logs/VoiceChannelSwitch')(client, oldState, newState);
});

client.on("voiceStateUpdate", (oldState, newState) => {
    if (!oldState.channel && newState.channel) {
        require('./events/logs/voiceChannelJoin.js')(client, newState.member, newState.channel);
    }
});

client.on("voiceStateUpdate", (oldState, newState) => {
    if (oldState.channel && !newState.channel) {
        require('./events/logs/voiceChannelLeave.js')(client, oldState.member, oldState.channel);
    }
});

client.on("voiceStateUpdate", (oldState, newState) => {
    // Détection du début du partage d'écran
    if (!oldState.streaming && newState.streaming) {
        require('./events/logs/voiceStreamingStart.js')(client, oldState.member, oldState.channel);
    }

    // Détection de l'arrêt du partage d'écran
    if (oldState.streaming && !newState.streaming) {
		require('./events/logs/voiceStreamingStop.js')(client, oldState.member, oldState.channel);
    }
});


const fs = require('fs');
const path = require('path');

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    require('./events/prevname/guildMemberUpdate')(client, oldMember, newMember);
});

const loadEvents = (dir = "./events/") => {
	readdirSync(dir).forEach(dirs => {
		const events = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));

		for (const event of events) {
			const evt = require(`${dir}/${dirs}/${event}`);
			const evtName = event.split(".")[0];
			client.on(evtName, evt.bind(null, client));
			console.log(`> Event Charger ${evtName}`)
		};
	});
};

loadEvents();
loadCommands();
