const db = require("quick.db");
const Discord = require("discord.js");

module.exports = async (client, oldMember, newMember) => {
    const guild = oldMember.guild;
    let chx = db.get(`logmod_${guild.id}`);
    const logsmod = guild.channels.cache.get(chx);
    const color = db.get(`color_${guild.id}`) || client.config.color;

    if (!logsmod) return; // Le salon de logs n'est pas configuré

    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    // Récupération des logs d'audit pour identifier l'actionneur
    const fetchedLogs = await guild.fetchAuditLogs({
        type: 'MEMBER_ROLE_UPDATE',
        limit: 5 // Augmenter la limite pour éviter une mauvaise correspondance
    });

    // On cherche l'entrée la plus récente qui correspond bien au membre
    const roleLog = fetchedLogs.entries.find(
        entry => entry.target.id === newMember.id && Date.now() - entry.createdTimestamp < 5000
    );

    const executor = roleLog ? roleLog.executor : null;

    // Détection des rôles ajoutés
    const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
    if (addedRoles.size > 0) {
        addedRoles.forEach(role => {
            const embed = new Discord.MessageEmbed()
                .setAuthor(`${newMember.user.username}`, newMember.user.displayAvatarURL({ dynamic: true }))
                .setColor(color)
                .setDescription(`📥 **<@${executor ? executor.id : "unknown"}>** a ajouté le rôle ${role} à ${newMember.user.username}`)
                //.setTimestamp();
            logsmod.send(embed);
        });
    }

    // Détection des rôles retirés
    const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));
    if (removedRoles.size > 0) {
        removedRoles.forEach(role => {
            const embed = new Discord.MessageEmbed()
                .setAuthor(`${newMember.user.username}`, newMember.user.displayAvatarURL({ dynamic: true }))
                .setColor(color)
                .setDescription(`📤 **<@${executor ? executor.id : "unknown"}>** a retiré le rôle ${role} à ${newMember.user.username}`)
                //.setTimestamp();
            logsmod.send(embed);
        });
    }
};
