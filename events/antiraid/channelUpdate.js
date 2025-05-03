const axios = require("axios");
const db = require("quick.db");
const { MessageEmbed } = require("discord.js");

module.exports = async (client, oldChannel, newChannel) => {
    const guild = oldChannel.guild;
    const color = db.get(`color_${guild.id}`) || client.config.color;
    const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

    try {
        // Audit Logs pour récupérer l'auteur de la modification
        const auditLogs = await guild.fetchAuditLogs({ type: "CHANNEL_UPDATE", limit: 1 });
        const logEntry = auditLogs.entries.first();

        if (!logEntry) {
            console.log("Aucun log d'audit trouvé.");
            return;
        }

        const { executor, createdTimestamp } = logEntry;
        if (!executor) {
            console.log("Aucun utilisateur détecté dans les logs d'audit.");
            return;
        }

        const userId = executor.id;

        // Empêcher les actions multiples sur le même événement
        const lastTimestamp = db.get(`lastChannelUpdate_${guild.id}_${userId}`) || 0;
        if (createdTimestamp === lastTimestamp) {
            //console.log("Action déjà traitée pour cet utilisateur.");
            return;
        }
        db.set(`lastChannelUpdate_${guild.id}_${userId}`, createdTimestamp);

        // Vérification de la whitelist
        const isWhitelisted =
            client.user.id === userId ||
            guild.ownerId === userId ||
            client.config.owner.includes(userId) ||
            db.get(`ownermd_${client.user.id}_${userId}`) ||
            db.get(`wlmd_${guild.id}_${userId}`);

        if (isWhitelisted) {
            console.log(`Utilisateur ${userId} est whitelisté, aucune action requise.`);
            return;
        }

        // Vérifier si la protection des salons est activée
        if (!db.get(`channelsmod_${guild.id}`)) {
            console.log("Système de protection des salons désactivé.");
            return;
        }

        // Application de la sanction
        const sanction = db.get(`channelsmodsanction_${guild.id}`) || "none";
        const sanctionApplied = await applySanction(guild, userId, sanction);

        // Restauration du salon
        const restoreSuccess = await restoreChannel(oldChannel, newChannel);

        // Envoi de logs
        if (raidlog) {
            const sanctionMessage = sanctionApplied ? `a été **${sanction}**` : `n'a pas pu être **${sanction}**`;
            const restoreMessage = restoreSuccess ? "restauré" : "n'a pas pu être restauré";

            raidlog.send(
                new MessageEmbed()
                    .setColor(color)
                    .setDescription(
                        `<@${userId}> a modifié le salon **${oldChannel.name}**. Il ${sanctionMessage}, et le salon a été ${restoreMessage}.`
                    )
            );
        }
    } catch (error) {
        console.error("Erreur dans l'événement channelUpdate :", error);

        // Envoi d'une log en cas d'erreur
        if (raidlog) {
            raidlog.send(
                new MessageEmbed()
                    .setColor(color)
                    .setDescription(
                        `Une erreur est survenue lors du traitement d'une modification sur le salon **${oldChannel.name}**.`
                    )
            );
        }
    }
};

// Fonction pour appliquer une sanction
async function applySanction(guild, userId, action) {
    try {
        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member) return false;

        if (action === "ban") {
            await guild.members.ban(userId, { days: 1, reason: "AntiChannel Update" });
        } else if (action === "kick") {
            await member.kick("AntiChannel Update");
        } else if (action === "derank") {
            await member.roles.set([]);
        } else {
            console.log("Aucune sanction à appliquer.");
            return false;
        }

        console.log(`Sanction ${action} appliquée à l'utilisateur ${userId}.`);
        return true;
    } catch (err) {
        console.error(`Erreur lors de la sanction ${action} :`, err);
        return false;
    }
}

// Fonction pour restaurer les propriétés du salon
async function restoreChannel(oldChannel, newChannel) {
    try {
        await newChannel.edit({
            name: oldChannel.name,
            topic: oldChannel.topic || null,
            nsfw: oldChannel.nsfw || false,
            bitrate: oldChannel.bitrate || null,
            userLimit: oldChannel.userLimit || null,
            rateLimitPerUser: oldChannel.rateLimitPerUser || null,
            position: oldChannel.rawPosition,
            reason: "AntiChannel Update",
        });

        const overwrites = oldChannel.permissionOverwrites.cache.map(overwrite => ({
            id: overwrite.id,
            allow: overwrite.allow.bitfield,
            deny: overwrite.deny.bitfield,
            type: overwrite.type,
        }));

        await newChannel.permissionOverwrites.set(overwrites);

        console.log(`Le salon ${oldChannel.name} a été restauré avec succès.`);
        return true;
    } catch (err) {
        console.error("Erreur lors de la restauration du salon :", err);
        return false;
    }
}
