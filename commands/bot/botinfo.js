const Discord = require('discord.js');
const db = require('quick.db');
const axios = require("axios");
const {
	MessageActionRow,
	MessageButton,
	MessageMenuOption,
	MessageMenu
} = require('discord-buttons');

module.exports = {
	name: 'botinfo',
	aliases: ['infobot', 'uptime'],
	run: async (client, message, args, prefix, color) => {

		if (client.config.owner.includes(message.author.id)) {

            const embed = new Discord.MessageEmbed()

            embed.setTitle(`Information à Propos De : ${client.user.username}`)
            embed.setURL('https://guns.lol/serial_checker')
            embed.setDescription('**Une description complète et détaillée du bot**')
            embed.setColor(color)
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter(`${client.config.name}`)
            .addFields(
                { name: '👑 Owner / Developer :', value: '<@1133246357960921158>', inline: true },
                { name: '🔌 Latence Ping Bot :', value: `\`${client.ws.ping}Ms\`` },
                { name: '🚀 Total Server(s) :', value: `\`${client.guilds.cache.size}\``, inline: true },
                { name: '👥 Total User(s) :', value: `\`${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}\``, inline: true },
                { name: '📞 Support :', value: `[Clique ici pour rejoindre le support](https://discord.gg/xNmW5MWDT3)`, inline: true },
                { name: '📗 Node.js Version :', value: `\`${process.version}\``, inline: true },
                { name: "📚 Discord.js Version :", value: `\`${Discord.version}\``, inline: true },
                { name: "🟢 Uptime :", value: `<t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`, inline: true },
                { name: '📊 Mémoire Utilisée :', value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``, inline: true },
                { name: '📡 Plateforme :', value: `\`${process.platform}\``, inline: true },
                { name: '💾 Architecture :', value: `\`${process.arch}\``, inline: true },
                { name: '⏱ Temps de Lancement :', value: `<t:${Math.floor(client.readyTimestamp / 1000)}:R>`, inline: true },
                { name: '💻 Processus PID :', value: `\`${process.pid}\``, inline: true },
                { name: '🖥 CPU Utilisation :', value: `\`${(process.cpuUsage().user / 1000000).toFixed(2)}%\``, inline: true },
                { name: '📈 Total Channels :', value: `\`${client.channels.cache.size}\``, inline: true },
                { name: '📤 Total Événements Émis :', value: `\`${client.listenerCount()}\``, inline: true },
                { name: '📥 Total Commandes Chargées :', value: `\`${client.commands.size}\``, inline: true }
            );

            message.channel.send(embed);
        }
    }
};
