const axios = require('axios');
const db = require("quick.db");
const Discord = require("discord.js");
const ms = require("ms");

module.exports = (client, member, voiceChannel) => {
    const color = db.get(`color_${member.guild.id}`) === null ? client.config.color : db.get(`color_${member.guild.id}`);
    let wass = db.get(`logvc_${voiceChannel.guild.id}`);
    const logschannel = voiceChannel.guild.channels.cache.get(wass);

    // Si un canal de log est défini
    if (logschannel) {
        // Calculer la durée depuis qu'il a commencé à partager son écran (en minutes et secondes)
        const startTime = member.voice.selfDeaf ? new Date() : null;  // Exemple si tu utilises un système pour savoir quand il a commencé
        const duration = startTime ? ms(new Date() - startTime) : 'Durée inconnue';

        // Construire l'embed de log avec des informations supplémentaires
        const embed = new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor(`${member.user.username}`, member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${member} a arrêté son partage dans ${voiceChannel.name}`)

        // Envoi de l'embed dans le canal de logs
        logschannel.send(embed);
    }
};
