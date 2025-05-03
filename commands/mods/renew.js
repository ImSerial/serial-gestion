const Discord = require('discord.js');
const db = require('quick.db');
const {
    MessageActionRow,
    MessageButton,
    MessageMenuOption,
    MessageMenu
} = require('discord-buttons');

module.exports = {
    name: 'renew',
    aliases: ['nuke'],

    run: async (client, message, args, prefix, color) => {
        let logsChannelId = db.get(`logmod_${message.guild.id}`);
        const logsmod = message.guild.channels.cache.get(logsChannelId);

        if (args[0] === "all") {
            if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true) {
                const channels = message.channel.guild.channels.cache.filter(ch => ch.type !== 'category');

                channels.forEach(async channele => {
                    try {
                        await channele.clone({
                            name: channele.name,
                            permissions: channele.permissionsOverwrites,
                            type: channele.type,
                            topic: channele.withTopic,
                            nsfw: channele.nsfw,
                            bitrate: channele.bitrate,
                            userLimit: channele.userLimit,
                            rateLimitPerUser: channele.rateLimitPerUser,
                            permissions: channele.withPermissions,
                            position: channele.rawPosition,
                            reason: `Tous les salons ont été recréés par ${message.author.tag} (${message.author.id})`
                        });
                        channele.delete();

                        // Envoi du log
                        if (logsmod) {
                            const embed = new Discord.MessageEmbed()
                                .setColor(color)
                                .setDescription(`Le salon ${channele.name} a été recréé par ${message.author}.`)
                                .setTimestamp();
                            logsmod.send(embed);
                        }
                    } catch (err) {
                        console.error(err);
                    }
                });
            }
        } else {
            let perm = "";
            message.member.roles.cache.forEach(role => {
                if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = null;
                if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            });
            if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {
                let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;
                if (channel === message.channel) {
                    try {
                        let ee = await channel.clone({
                            name: channel.name,
                            permissions: channel.permissionsOverwrites,
                            type: channel.type,
                            topic: channel.withTopic,
                            nsfw: channel.nsfw,
                            bitrate: channel.bitrate,
                            userLimit: channel.userLimit,
                            rateLimitPerUser: channel.rateLimitPerUser,
                            permissions: channel.withPermissions,
                            position: channel.rawPosition,
                            reason: `Le salon a été recréé par ${message.author.tag} (${message.author.id})`
                        });
                        channel.delete();
                        ee.send(`${message.author}, le salon a été recréé.`);

                        // Envoi du log
                        if (logsmod) {
                            const embed = new Discord.MessageEmbed()
                                .setColor(color)
                                .setDescription(`${message.author} a renew ${channel.name}.`)
                            logsmod.send(embed);
                        }
                    } catch (error) {
                        console.error(error);
                        return;
                    }
                } else {
                    try {
                        let ee = await channel.clone({
                            name: channel.name,
                            permissions: channel.permissionsOverwrites,
                            type: channel.type,
                            topic: channel.withTopic,
                            nsfw: channel.nsfw,
                            bitrate: channel.bitrate,
                            userLimit: channel.userLimit,
                            rateLimitPerUser: channel.rateLimitPerUser,
                            permissions: channel.withPermissions,
                            position: channel.rawPosition,
                            reason: `Le salon a été recréé par ${message.author.tag} (${message.author.id})`
                        });
                        channel.delete();
                        ee.send(`${message.author}, le salon a été recréé.`);

                        // Envoi du log
                        if (logsmod) {
                            const embed = new Discord.MessageEmbed()
                                .setColor(color)
                                .setDescription(`${message.author} a renew ${channel.name}.`)
                            logsmod.send(embed);
                        }
                    } catch (error) {
                        console.error(error);
                        return;
                    }

                    message.channel.send(`Le salon a été recréé : ${channel.name}`);
                }
            }
        }
    }
};
