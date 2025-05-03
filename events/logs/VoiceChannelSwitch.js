const db = require("quick.db");
const Discord = require("discord.js");

module.exports = async (client, oldState, newState) => {
    const color = db.get(`color_${newState.guild.id}`) === null ? client.config.color : db.get(`color_${newState.guild.id}`);
    let wass = db.get(`logvc_${newState.guild.id}`);
    const logschannel = newState.guild.channels.cache.get(wass);

    // Vérifie si l'utilisateur a changé de salon vocal uniquement
    if (oldState.channelID && newState.channelID && oldState.channelID !== newState.channelID) {
        if (logschannel) {
            const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setAuthor(`${newState.member.user.username}`, newState.member.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`${newState.member} a été déplacé de ${oldState.channel.name} à ${newState.channel.name}`)

            logschannel.send(embed);
        }
    }
};
