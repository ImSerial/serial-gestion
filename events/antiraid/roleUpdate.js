const { MessageEmbed } = require("discord.js");
const db = require("quick.db");

module.exports = async (client, oldRole, newRole) => {
    const guild = oldRole.guild;
    const color = db.get(`color_${guild.id}`) || client.config.color;

    try {
        // Récupération des logs d'audit
        const auditLogs = await guild.fetchAuditLogs({ type: 'ROLE_UPDATE', limit: 1 });
        const logEntry = auditLogs.entries.first();

        if (!logEntry) return console.log('Aucune entrée d\'audit trouvée pour cette mise à jour de rôle.');

        const userId = logEntry.executor.id;

        // Vérifier si l'exécuteur est le bot
        if (userId === client.user.id) return;

        // Récupérer le canal de logs de raid
        const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

        // Vérifier les permissions/whitelist
        const isWhitelisted = client.user.id === userId ||
                              guild.ownerID === userId ||
                              client.config.owner.includes(userId) ||
                              db.get(`ownermd_${client.user.id}_${userId}`) ||
                              db.get(`wlmd_${guild.id}_${userId}`);

        if (!isWhitelisted && db.get(`rolesmod_${guild.id}`)) {
            const sanction = db.get(`rolesmodsanction_${guild.id}`) || "none";

            // Appliquer la sanction appropriée
            const success = await applySanction(guild, userId, sanction);

            // Restaurer les propriétés du rôle
            await newRole.edit({
                name: oldRole.name,
                color: oldRole.color,
                permissions: oldRole.permissions,
                hoist: oldRole.hoist,
                mentionable: oldRole.mentionable,
                position: oldRole.rawPosition
            });

            // Envoyer un message de log si nécessaire
            if (raidlog) {
                const action = success ? sanction : `n'a pas pu être ${sanction}`;
                raidlog.send(new MessageEmbed()
                    .setColor(color)
                    .setDescription(`<@${userId}> a modifié le rôle ${oldRole.name}, il a été ${action} !`)
                );
            }
        }
    } catch (err) {
        console.error('Erreur dans l\'événement roleUpdate:', err);
    }
};

async function applySanction(guild, userId, action) {
    try {
        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member) return false;

        if (action === 'ban') {
            await guild.members.ban(userId, { days: 1, reason: 'AntiRoleUpdate' });
        } else if (action === 'kick') {
            await member.kick('AntiRoleUpdate');
        } else if (action === 'derank') {
            await member.roles.set([]);
        } else {
            return false; // Aucune action
        }

        return true;
    } catch (err) {
        console.error(`Erreur lors de la sanction ${action}:`, err);
        return false;
    }
}
