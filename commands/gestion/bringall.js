const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'bringall',
    aliases: ["bring"],

    run: async (client, message, args, prefix, color) => {
        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`admin_${message.guild.id}_${role.id}`) || db.get(`ownerp_${message.guild.id}_${role.id}`)) {
                perm = true;
                return; // Quitte la boucle dès qu'une permission est trouvée
            }
        });

        // Vérification des permissions
        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {
            // Vérification de l'argument ID de salon vocal
            if (args[0]) {
                // Essayer de récupérer le salon par ID
                let targetChannel = message.guild.channels.cache.get(args[0]);

                // Débogage : vérifier si le salon existe et est valide
                console.log(`ID du salon : ${args[0]}`);
                console.log(`Salon trouvé :`, targetChannel);

                if (!targetChannel) {
                    return message.channel.send("L'ID fourni ne correspond à aucun salon.");
                }

                // Vérifier si c'est un salon vocal
                if (targetChannel.type !== 'voice') {
                    return message.channel.send("L'ID fourni ne correspond pas à un salon vocal.");
                }

                // Filtrer les membres en vocal
                let channel = message.guild.members.cache.filter(u => u.voice.channel);
                if (channel.size === 0) return message.channel.send("Aucun membre n'est en vocal.");

                // Déplacer les membres en vocal
                channel.forEach(member => {
                    // Vérifier si le membre est déjà dans un salon vocal avant de le déplacer
                    if (member.voice.channel) {
                        member.voice.setChannel(targetChannel, `BringAll par ${message.author.tag}`).catch(err => {
                            console.error("Erreur lors du déplacement d'un membre :", err);
                        });
                    }
                });

                // Envoi du log
                let logsChannelId = db.get(`logmod_${message.guild.id}`);
                const logsmod = message.guild.channels.cache.get(logsChannelId);

                if (logsmod) {
                    const embed = new Discord.MessageEmbed()
                        .setColor(color)
                        .setDescription(`${message.author} a déplacé tous les membres en vocal vers le salon ${targetChannel.name}.`)
                    logsmod.send(embed);
                }

                return message.channel.send(`Tous les membres en vocal ont été déplacés vers le salon ${targetChannel.name}.`);
            } else {
                return message.channel.send("Veuillez fournir un ID de salon vocal valide.");
            }
        } else {
            return;
        }
    }
};
