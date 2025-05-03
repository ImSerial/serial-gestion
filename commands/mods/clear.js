const Discord = require('discord.js');
const db = require('quick.db');
const {
    MessageActionRow,
    MessageButton,
    MessageMenuOption,
    MessageMenu
} = require('discord-buttons');

module.exports = {
    name: 'clear',
    aliases: ['purge'],

    run: async (client, message, args, prefix, color) => {
        let perm = "";
        message.member.roles.cache.forEach(role => {
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = null;
        });

        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {
            let logsChannelId = db.get(`logmod_${message.guild.id}`);
            const logsmod = message.guild.channels.cache.get(logsChannelId);

            if (message.mentions.members.first()) {
                message.delete();
                message.channel.messages.fetch({
                        limit: 100
                    })
                    .then((messages) => {
                        var filterUser = message.mentions.members.first().id;
                        var filtered = messages.filter(m => m.author.id === filterUser).array().slice(0, 100);
                        message.channel.bulkDelete(filtered, true);

                        // Envoi du log
                        if (logsmod) {
                            const embed = new Discord.MessageEmbed()
                                .setColor(color)
                                .setDescription(`${filtered.length} messages de ${message.mentions.members.first()} ont été supprimés par ${message.author} dans le salon ${message.channel}.`)
                            logsmod.send(embed);
                        }
                    }).catch();
            } else if (args[0]) {
                if (isNaN(args.slice(0).join(" "))) return;
                let amount = 0;
                if (args.slice(0).join(" ") === '1' || args.slice(0).join(" ") === '0') {
                    amount = 1;
                } else {
                    message.delete();
                    amount = args.slice(0).join(" ");
                    if (amount > 100) {
                        amount = 100;
                    }
                }
                await message.channel.bulkDelete(amount, true).then((_message) => {
                    // Envoi du log
                    if (logsmod) {
                        const embed = new Discord.MessageEmbed()
                            .setColor(color)
                            .setDescription(`${message.author} a clear ${amount} messages dans ${message.channel}.`)
                        logsmod.send(embed);
                    }
                });
            } else {
                message.delete();
                await message.channel.bulkDelete(100, true).then(async (_message) => {
                    setTimeout(async function () {
                        await message.channel.bulkDelete(100, true);

                        // Envoi du log
                        if (logsmod) {
                            const embed = new Discord.MessageEmbed()
                                .setColor(color)
                                .setDescription(`${message.author} a clear tout les messages dans ${message.channel}.`)
                            logsmod.send(embed);
                        }
                    }, 1000);
                });
            }
        }
    }
};
