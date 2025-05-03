const axios = require('axios'); // Pour effectuer des requêtes HTTP (e.g., bannir un membre via l'API Discord).
const db = require("quick.db"); // Base de données pour stocker les configurations spécifiques au serveur.
const { MessageEmbed } = require("discord.js"); // Pour créer des messages riches (embeds) sur Discord.
const request = require("request"); // Utilisé pour supprimer les webhooks.

module.exports = async (client, channelUpdated) => {
    const guild = channelUpdated.guild; // Récupération de la guilde (serveur) où l'événement s'est produit.
    const color = db.get(`color_${guild.id}`) || client.config.color; // Couleur pour les messages embeds.
    const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`)); // Canal pour les logs de raid.

    // Récupération des logs d'audit pour identifier le créateur du webhook.
    const executor = await guild.fetchAuditLogs({
        limit: 1,
        type: "WEBHOOK_CREATE"
    }).then(audit => audit.entries.first()).catch(() => null);

    if (!executor || !executor.executor) return; // Si aucune action ou exécuteur n'est trouvée, arrêter ici.

    // Définir les permissions spéciales (whitelist).
    let perm = false;
    const isWhitelistEnabled = db.get(`webhookwl_${guild.id}`); // Vérifie si l'anti-webhook ignore la whitelist.
    const isWhitelisted = db.get(`wlmd_${guild.id}_${executor.executor.id}`) === true || 
                          db.get(`ownermd_${client.user.id}_${executor.executor.id}`) === true ||
                          client.config.owner.includes(executor.executor.id) || 
                          guild.ownerId === executor.executor.id;

    // Logique pour les permissions (whitelist activée ou non).
    if (isWhitelistEnabled === null) {
        perm = isWhitelisted;
    } else if (isWhitelistEnabled === true) {
        perm = db.get(`ownermd_${client.user.id}_${executor.executor.id}`) === true || 
               client.config.owner.includes(executor.executor.id) || 
               guild.ownerId === executor.executor.id;
    }

    // Vérification : si l'utilisateur n'est pas whitelisté et que l'anti-webhook est activé.
    if (db.get(`webhook_${guild.id}`) === true && !perm) {
        const sanction = db.get(`webhooksanction_${guild.id}`); // Sanction configurée (ban, kick, derank).
        let sanctionResult = "Aucune sanction appliquée.";

        // Application de la sanction choisie.
        if (sanction === "ban") {
            try {
                await axios({
                    url: `https://discord.com/api/v9/guilds/${guild.id}/bans/${executor.executor.id}`,
                    method: 'PUT',
                    headers: {
                        Authorization: `Bot ${client.config.token}`
                    },
                    data: {
                        delete_message_days: '1',
                        reason: 'AntiWebhook'
                    }
                });
                sanctionResult = `L'utilisateur <@${executor.executor.id}> a été **banni** pour création de webhook non autorisé.`;
            } catch (err) {
                sanctionResult = `Impossible de bannir l'utilisateur <@${executor.executor.id}> pour création de webhook non autorisé.`;
            }
        } else if (sanction === "kick") {
            try {
                await guild.members.cache.get(executor.executor.id).kick("AntiWebhook - Création de webhook non autorisé.");
                sanctionResult = `L'utilisateur <@${executor.executor.id}> a été **kick** pour création de webhook non autorisé.`;
            } catch (err) {
                sanctionResult = `Impossible de kick l'utilisateur <@${executor.executor.id}> pour création de webhook non autorisé.`;
            }
        } else if (sanction === "derank") {
            try {
                await guild.members.cache.get(executor.executor.id).roles.set([]);
                sanctionResult = `L'utilisateur <@${executor.executor.id}> a été **dérank** pour création de webhook non autorisé.`;
            } catch (err) {
                sanctionResult = `Impossible de dérank l'utilisateur <@${executor.executor.id}> pour création de webhook non autorisé.`;
            }
        }

        // Suppression des webhooks créés par l'utilisateur.
        channelUpdated.fetchWebhooks().then((webhooks) => {
            for (const webhook of webhooks.values()) {
                request({
                    url: `https://discord.com/api/v9/webhooks/${webhook.id}`,
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bot ${client.config.token}`
                    }
                }, (error, response, body) => {
                    if (raidlog) raidlog.send(new MessageEmbed()
                        .setColor(color)
                        .setDescription(`Le webhook **${webhook.name}** a été supprimé.`));
                });
            }
        }).catch(() => {});

        // Log dans le canal de raid.
        if (raidlog) {
            raidlog.send(new MessageEmbed()
                .setColor(color)
                .setDescription(`<@${executor.executor.id}> à crée un webhook, ${sanctionResult}`));
        }
    } else if (perm && raidlog) {
};
    // Suppression automatique des messages liés aux webhooks (optionnel).
    channelUpdated.messages.fetch({ limit: 100 }).then((messages) => {
        const webhookMessages = messages.filter(m => m.webhookId);
        channelUpdated.bulkDelete(webhookMessages, true).catch(() => {});
    });
};
