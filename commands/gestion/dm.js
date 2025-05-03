const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'dm',
    aliases: ['privatemsg'],

    run: async (client, message, args, prefix, color) => {
        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) {
                perm = true;
                return;
            }
        });

        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${message.guild.id}_${message.author.id}`) === true || perm) {
            if (args.length < 2 && message.attachments.size === 0) 
                return message.channel.send("**Veuillez mentionner au moins une personne et fournir un message ou un média.**");

            let members = message.mentions.members.map(m => m) || [];
            args.forEach(arg => {
                let member = message.guild.members.cache.get(arg);
                if (member && !members.includes(member)) members.push(member);
            });

            let content = args.filter(arg => !message.mentions.has(arg) && !message.guild.members.cache.has(arg)).join(" ");

            const MAX_FILE_SIZE = 8 * 1024 * 1024;
            let attachments = message.attachments.filter(att => att.size <= MAX_FILE_SIZE).map(att => att.url);

            if (attachments.length !== message.attachments.size) {
                message.channel.send("⚠ Certains fichiers sont trop volumineux et ne seront pas envoyés.");
            }

            if (members.length === 0) return message.channel.send("⚠ **Aucun membre valide mentionné.**");
            if (!content.trim() && attachments.length === 0) return message.channel.send("⚠ **Veuillez spécifier un message ou un média.**");

            let success = 0, failed = 0;

            for (const member of members) {
                if (!member.user.bot) {
                    try {
                        if (!member.user.dmChannel) {
                            try {
                                await member.user.createDM();
                            } catch (err) {
                                failed++;
                                continue;
                            }
                        }

                        if (content.length > 2000) {
                            message.channel.send(`⚠ Le message pour **${member.user.tag}** est trop long (max 2000 caractères).`);
                            failed++;
                            continue;
                        }

                        await member.send(content.trim() || "", { files: attachments.length > 0 ? attachments : [] });
                        success++;
                    } catch (err) {
                        console.error(`Impossible d'envoyer un DM à ${member.user.tag}: ${err.message}`);
                        if (err.message.includes("Cannot send messages to this user")) {
                            message.channel.send(`⚠ Impossible d'envoyer un DM à ${member.user.tag}, il a désactivé ses messages privés.`);
                        }
                        failed++;
                    }
                    
                    await new Promise(res => setTimeout(res, 5000));
                }
            }

            const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                .setTitle("Message Privé")
                .setDescription(`**Message envoyé à** \`${success}\` **membres.**\n**Échecs :** \`${failed}\` membres.`);

            message.channel.send(embed);

            let logsChannelId = db.get(`logmod_${message.guild.id}`);
            const logsmod = message.guild.channels.cache.get(logsChannelId);

            if (logsmod) {
                const logEmbed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                    .setDescription(`${message.author} a effectué un **dm** à ${members.length} membre(s) *(succès: ${success}, échecs: ${failed})*`);
                logsmod.send(logEmbed);
            }
        }
    }
};
