const db = require("quick.db");
const Discord = require("discord.js");

module.exports = async (client, oldState, newState) => {
    const color = db.get(`color_${newState.guild.id}`) === null ? client.config.color : db.get(`color_${newState.guild.id}`);
    let wass = db.get(`logvc_${newState.guild.id}`);
    const logschannel = newState.guild.channels.cache.get(wass);

    if (!logschannel) return;

    const channelName = newState.channel ? newState.channel.name : "Salon inconnu";

    // Détection du mute/démute micro
    if (!oldState.selfMute && newState.selfMute) {
        const embed = new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor(`${newState.member.user.username}`, newState.member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${newState.member} s'est mute micro dans ${channelName}`)
        return logschannel.send(embed);
    }

    if (oldState.selfMute && !newState.selfMute) {
        const embed = new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor(`${newState.member.user.username}`, newState.member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${newState.member} s'est demute micro dans ${channelName}`)
        return logschannel.send(embed);
    }

    // Détection du mute/démute casque
    if (!oldState.selfDeaf && newState.selfDeaf) {
        const embed = new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor(`${newState.member.user.username}`, newState.member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${newState.member} s'est mute casque dans ${channelName}`)
        return logschannel.send(embed);
    }

    if (oldState.selfDeaf && !newState.selfDeaf) {
        const embed = new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor(`${newState.member.user.username}`, newState.member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${newState.member} s'est demute casque dans ${channelName}`)
        return logschannel.send(embed);
    }

    // Détection du mute serveur (force-mute)
    if (!oldState.serverMute && newState.serverMute) {
        const executor = newState.guild.fetchAuditLogs({ type: 'MEMBER_UPDATE', limit: 1 })
            .then(audit => audit.entries.first()?.executor || "Inconnu");

        executor.then(executor => {
            const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setAuthor(`${newState.member.user.username}`, newState.member.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`${newState.member} s'est fait mute serveur par ${executor.tag} dans ${channelName}`)
            logschannel.send(embed);
        });
    }

    if (oldState.serverMute && !newState.serverMute) {
        const executor = newState.guild.fetchAuditLogs({ type: 'MEMBER_UPDATE', limit: 1 })
            .then(audit => audit.entries.first()?.executor || "Inconnu");

        executor.then(executor => {
            const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setAuthor(`${newState.member.user.username}`, newState.member.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`${newState.member} s'est fait unmute serveur par ${executor.tag} dans ${channelName}`)
            logschannel.send(embed);
        });
    }
};
