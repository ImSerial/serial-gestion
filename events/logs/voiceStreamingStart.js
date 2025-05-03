const axios = require('axios');
const db = require("quick.db");
const Discord = require("discord.js");
const ms = require("ms");

module.exports = (client, member, voiceChannel) => {
    // Vérification que le salon vocal existe
    if (!voiceChannel) return;

    const color = db.get(`color_${member.guild.id}`) ?? client.config.color;
    let wass = db.get(`logvc_${member.guild.id}`);
    if (!wass) return;

    const logschannel = member.guild.channels.cache.get(wass);
    if (!logschannel) return;

    // Création et envoi de l'embed de log
    const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor(`${member.user.username}`, member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`${member} partage son écran dans ${voiceChannel.name}`);

    logschannel.send(embed);
};
