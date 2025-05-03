const axios = require('axios');
const db = require("quick.db");
const { MessageEmbed } = require("discord.js");

module.exports = async (client, role) => {
    const guild = role.guild;
    const color = db.get(`color_${guild.id}`) || client.config.color;
    const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

    // Vérifier les permissions du bot avant de procéder
    if (!guild.me.permissions.has(['VIEW_AUDIT_LOG', 'MANAGE_ROLES', 'BAN_MEMBERS'])) {
        console.error("Le bot n'a pas les permissions nécessaires pour gérer cet événement.");
        return;
    }

    try {
        // Récupérer les logs d'audit
        const logs = await guild.fetchAuditLogs({ limit: 1, type: "ROLE_CREATE" });
        const entry = logs.entries.first();

        if (!entry || !entry.executor) {
            console.log("Aucune entrée d'audit valide trouvée pour la création du rôle.");
            return;
        }

        const executor = entry.executor;

        // Vérification des permissions de l'exécuteur
        let isPermitted = false;
        if (db.get(`rolescreatewl_${guild.id}`) === null) {
            isPermitted = client.user.id === executor.id ||
                guild.ownerId === executor.id ||
                client.config.owner.includes(executor.id) ||
                db.get(`ownermd_${client.user.id}_${executor.id}`) === true ||
                db.get(`wlmd_${guild.id}_${executor.id}`) === true;
        } else if (db.get(`rolescreatewl_${guild.id}`) === true) {
            isPermitted = client.user.id === executor.id ||
                guild.ownerId === executor.id ||
                client.config.owner.includes(executor.id) ||
                db.get(`ownermd_${client.user.id}_${executor.id}`) === true;
        }

        if (db.get(`rolescreate_${guild.id}`) && !isPermitted) {
            const sanction = db.get(`rolescreatesanction_${guild.id}`);
            const member = guild.members.cache.get(executor.id);

            if (!member) {
                if (raidlog) {
                    raidlog.send(new MessageEmbed()
                        .setColor(color)
                        .setDescription(`Impossible de trouver l'exécuteur <@${executor.id}> pour appliquer la sanction.`));
                }
                return;
            }

            // Supprimer le rôle créé
            await role.delete("AntiRôle Create - Création non autorisée")
                .catch(err => console.error(`Erreur lors de la suppression du rôle: ${err.message}`));

            // Appliquer la sanction
            if (sanction === "ban") {
                try {
                    await member.ban({ days: 1, reason: "AntiRôle Create - Création non autorisée" });
                    if (raidlog) {
                        raidlog.send(new MessageEmbed()
                            .setColor(color)
                            .setDescription(`<@${executor.id}> a créé le rôle \`${role.name}\`, il a été **banni** !`));
                    }
                } catch (err) {
                    console.error(`Erreur lors du bannissement de ${executor.id}: ${err.message}`);
                    if (raidlog) {
                        raidlog.send(new MessageEmbed()
                            .setColor(color)
                            .setDescription(`<@${executor.id}> a créé le rôle \`${role.name}\`, mais il n'a pas pu être **banni**.`));
                    }
                }
            } else if (sanction === "kick") {
                try {
                    await member.kick("AntiRôle Create - Création non autorisée");
                    if (raidlog) {
                        raidlog.send(new MessageEmbed()
                            .setColor(color)
                            .setDescription(`<@${executor.id}> a créé le rôle \`${role.name}\`, il a été **expulsé** !`));
                    }
                } catch (err) {
                    console.error(`Erreur lors de l'expulsion de ${executor.id}: ${err.message}`);
                    if (raidlog) {
                        raidlog.send(new MessageEmbed()
                            .setColor(color)
                            .setDescription(`<@${executor.id}> a créé le rôle \`${role.name}\`, mais il n'a pas pu être **expulsé**.`));
                    }
                }
            } else if (sanction === "derank") {
                try {
                    await member.roles.set([]);
                    if (raidlog) {
                        raidlog.send(new MessageEmbed()
                            .setColor(color)
                            .setDescription(`<@${executor.id}> a créé le rôle \`${role.name}\`, il a été **déranké** !`));
                    }
                } catch (err) {
                    console.error(`Erreur lors du dérankage de ${executor.id}: ${err.message}`);
                    if (raidlog) {
                        raidlog.send(new MessageEmbed()
                            .setColor(color)
                            .setDescription(`<@${executor.id}> a créé le rôle \`${role.name}\`, mais il n'a pas pu être **déranké**.`));
                    }
                }
            }
        }
    } catch (error) {
        console.error("Erreur lors du traitement des logs d'audit ou des actions :", error.message);
    }
};
