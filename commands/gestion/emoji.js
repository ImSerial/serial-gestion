const Discord = require('discord.js');
const db = require('quick.db');
const { MessageActionRow, MessageButton, MessageMenuOption, MessageMenu } = require('discord-buttons');

module.exports = {
    name: 'emoji',
    aliases: ["emojis", "create"],
    run: async (client, message, args, prefix, color) => {
        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
        });
        
        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {
            if (args[0] === "add") {
                const emojis = args.slice(1);
                if (emojis.length === 0) return message.channel.send('Veuillez fournir au moins un emoji.');
                
                let count = 0;
                const addEmojis = async () => {
                    for (const emoji of emojis) {
                        let customemoji = Discord.Util.parseEmoji(emoji);
                        if (customemoji && customemoji.id) {
                            const Link = `https://cdn.discordapp.com/emojis/${customemoji.id}.${customemoji.animated ? "gif" : "png"}`;
                            const name = customemoji.name;
                            await message.guild.emojis.create(Link, name).catch(() => {});
                            count++;
                            await new Promise(resolve => setTimeout(resolve, 1500)); // Évite le rate limit
                        }
                    }
                    message.channel.send(`${count} ${count > 1 ? "émojis ont été créés" : "émoji a été créé"}.`);
                };
                addEmojis();
            }
            
            if (args[0] === "remove") {
                const emojis = args.slice(1);
                if (emojis.length === 0) return message.channel.send(`Veuillez fournir au moins un emoji à supprimer.`);
                
                let count = 0;
                const removeEmojis = async () => {
                    for (const emoji of emojis) {
                        let customemoji = Discord.Util.parseEmoji(emoji);
                        let foundEmoji = null;

                        if (customemoji && customemoji.id) {
                            foundEmoji = message.guild.emojis.cache.get(customemoji.id);
                        } else {
                            foundEmoji = message.guild.emojis.cache.find(e => e.name === emoji);
                        }

                        if (foundEmoji) {
                            await foundEmoji.delete().catch(() => {});
                            count++;
                            await new Promise(resolve => setTimeout(resolve, 1500)); // Évite le rate limit
                        }
                    }
                    if (count > 0) {
                        message.channel.send(`${count} ${count > 1 ? "émojis ont été supprimés" : "émoji a été supprimé"}.`);
                    } else {
                        message.channel.send(`❌ Aucun emoji valide à supprimer.`);
                    }
                };
                removeEmojis();
            }
            
            if (args[0] === "clear") {
                const emojis = message.guild.emojis.cache.array();
                if (emojis.length === 0) return message.channel.send(`Aucun emoji à supprimer.`);
                
                let count = 0;
                const deleteEmojis = async () => {
                    for (const emoji of emojis) {
                        await emoji.delete().catch(() => {});
                        count++;
                        await new Promise(resolve => setTimeout(resolve, 1500)); // Évite le rate limit
                    }
                    message.channel.send(`${count} ${count > 1 ? "émojis ont été supprimés" : "émoji a été supprimé"}.`);
                };
                deleteEmojis();
            }
        }
    }
};
