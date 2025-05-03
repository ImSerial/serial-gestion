const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'dmall',
    aliases: ['dmallrole'],

    run: async (client, message, args, prefix, color) => {
        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) {
                perm = true;
                return;
            }
        });

        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {
            if (!args[0] && message.attachments.size === 0) return message.channel.send("**Veuillez spécifier un message ou un média à envoyer.**");

            let targetRole = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
            let content = targetRole ? args.slice(1).join(" ") : args.join(" ");
            let attachments = message.attachments.array().map(att => att.url);

            if (!content && attachments.length === 0) return message.channel.send("**Veuillez spécifier un message ou un média à envoyer.**");

            let members;
            if (targetRole) {
                members = targetRole.members;
            } else {
                members = await message.guild.members.fetch();
            }

            if (members.size === 0) return message.channel.send("⚠ **Aucun membre trouvé pour cet envoi de message.**");

            let success = 0, failed = 0;

            for (const member of members.values()) {
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

                        await member.send(content || "", { files: attachments.length > 0 ? attachments : [] });
                        success++;
                    } catch (err) {
                        console.error(`Impossible d'envoyer un DM à ${member.user.tag}: ${err.message}`);
                        failed++;
                    }
                    await new Promise(res => setTimeout(res, 2500));
                }
            }

            const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                .setTitle("DM All")
                .setDescription(`**Le message a été envoyé à** \`${success}\` **membres.**\n**Échecs :** \`${failed}\` membres.`);

            // Message de confirmation qui RESTE dans le salon
            message.channel.send(embed);

            let logsChannelId = db.get(`logmod_${message.guild.id}`);
            const logsmod = message.guild.channels.cache.get(logsChannelId);

            if (logsmod) {
                const logEmbed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                    .setDescription(`${message.author} a effectué un **dmall** sur ${targetRole ? targetRole : "tout le serveur"} *(ce dmall a touché ${success} membres)*`);
                logsmod.send(logEmbed);
            }
        }
    }
};
