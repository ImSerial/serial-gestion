const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'bring',
    run: async (client, message, args, prefix, color) => {
        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`admin_${message.guild.id}_${role.id}`) || db.get(`ownerp_${message.guild.id}_${role.id}`)) {
                perm = true;
                return;
            }
        });

        // Vérification des permissions
        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {
            // Vérification des arguments
            if (!args[0] || !args[1]) {
                return message.channel.send("Veuillez mentionner un membre ou fournir son ID, ainsi qu'un ID de salon vocal.");
            }

            // Récupération du membre
            let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!member) {
                return message.channel.send("Le membre spécifié est introuvable.");
            }

            // Vérification si le membre est en vocal
            if (!member.voice.channel) {
                return message.channel.send("Le membre n'est pas dans un salon vocal.");
            }

            // Récupération du salon vocal
            let targetChannel = message.guild.channels.cache.get(args[1]);

            // Vérification du salon vocal pour Discord.js v12 et v14
            if (!targetChannel || (targetChannel.type !== 'voice' && targetChannel.type !== 'GUILD_VOICE')) {
                return message.channel.send("L'ID fourni ne correspond pas à un salon vocal valide.");
            }

            // Déplacer le membre
            member.voice.setChannel(targetChannel, `Bring par ${message.author.tag}`).catch(err => {
                console.error("Erreur lors du déplacement du membre :", err);
                return message.channel.send("Une erreur est survenue lors du déplacement du membre.");
            });

            // Envoi du log
            let logsChannelId = db.get(`logmod_${message.guild.id}`);
            const logsmod = message.guild.channels.cache.get(logsChannelId);

            if (logsmod) {
                const embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setDescription(`${message.author} a déplacé ${member} vers le salon ${targetChannel.name}.`);
                logsmod.send(embed);
            }

            return message.channel.send(`${member} a été déplacé vers ${targetChannel.name}.`);
        } else {
            return;
        }
    }
};
