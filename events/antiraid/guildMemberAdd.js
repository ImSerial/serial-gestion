const axios = require('axios'); // Pour effectuer des requêtes HTTP, utilisé pour bannir via l'API Discord.
const db = require("quick.db"); // Base de données pour stocker les configurations spécifiques au serveur.
const { MessageEmbed } = require("discord.js"); // Pour créer des messages riches (embeds) sur Discord.
const ms = require("ms"); // Utilitaire pour manipuler des durées (e.g., "10s" en millisecondes).
const Discord = require("discord.js"); // Client et structures pour Discord.

module.exports = async (client, member) => {
    const guild = member.guild; // Récupération de la guilde (serveur) où l'événement s'est produit.
    const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`)); // Canal pour les logs de raid.
    const color = db.get(`color_${guild.id}`) || client.config.color; // Définition de la couleur pour les messages (par défaut ou personnalisé).

    // 1. Vérification de l'anti-token (anti-mass join)
    if (db.get(`antitoken_${member.guild.id}`) === true) {
        // Anti-token logic (désactivé ici car commenté).
        // Ce système pourrait être utilisé pour détecter les raids massifs.
    }

    // 2. Vérification de la création récente des comptes
    if (db.get(`crealimit_${member.guild.id}`) === true) {
        const duration = ms(db.get(`crealimittemps_${member.guild.id}`) || "0s"); // Temps minimum de création du compte.
        const created = member.user.createdTimestamp; // Date de création du compte.
        const diff = Date.now() - (created + duration); // Différence entre la date de création et la durée configurée.

        if (diff < 0) {
            // Si le compte est trop récent, il est kické.
            await member.kick().catch(() => {}); // Kick sans bloquer le processus si une erreur survient.
            const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setDescription(`${member} à été **kick** parce que \`son compte est trop récent\``);
            if (raidlog) raidlog.send(embed); // Log dans le canal de raid.
        }
    }

    // 3. Vérification de la blacklist des membres
    if (db.get(`blmd_${client.user.id}_${member.id}`) === true) {
        await member.ban().then(() => {
            if (raidlog) {
                raidlog.send(new MessageEmbed()
                    .setColor(color)
                    .setDescription(`${member} a rejoint alors qu'il était blacklisté, il a été **banni**.`));
            }
        }).catch(() => {
            if (raidlog) {
                raidlog.send(new MessageEmbed()
                    .setColor(color)
                    .setDescription(`${member} a rejoint alors qu'il était blacklisté, mais n'a pas pu être **banni**.`));
            }
        });
    }

    // 4. Gestion des bots invités
    if (member.user.bot) {
        // Récupérer les logs d'audit pour identifier qui a invité le bot.
        const action = await guild.fetchAuditLogs({
            limit: 1,
            type: "BOT_ADD"
        }).then((audit) => audit.entries.first()).catch(() => null);

        if (!action) return; // Si aucun log n'est trouvé, arrêter ici.

        const executor = action.executor; // Utilisateur ayant invité le bot.

        // Vérification des permissions de l'exécuteur.
        const isWhitelisted = db.get(`wlmd_${guild.id}_${executor.id}`) === true || 
                              guild.ownerId === executor.id || 
                              client.config.owner.includes(executor.id);

        if (!isWhitelisted) {
            // Si l'utilisateur n'est pas whitelisté, appliquer une sanction.
            const sanction = db.get(`botsanction_${guild.id}`); // Récupération de la sanction configurée (ban, kick, derank).

            if (sanction === "ban") {
                try {
                    // Bannir l'utilisateur ayant invité le bot.
                    await axios({
                        url: `https://discord.com/api/v9/guilds/${guild.id}/bans/${executor.id}`,
                        method: 'PUT',
                        headers: {
                            Authorization: `Bot ${client.config.token}`
                        },
                        data: {
                            delete_message_days: '1',
                            reason: "AntiBot - Invitation de bot non autorisé."
                        }
                    });
                    if (raidlog) raidlog.send(new MessageEmbed()
                        .setColor(color)
                        .setDescription(`<@${executor.id}> a invité le bot ${member}, il a été **banni**.`));
                } catch (err) {
                    if (raidlog) raidlog.send(new MessageEmbed()
                        .setColor(color)
                        .setDescription(`<@${executor.id}> a invité le bot ${member}, mais n'a pas pu être **banni**.`));
                }
            } else if (sanction === "kick") {
                try {
                    // Expulser l'utilisateur ayant invité le bot.
                    await guild.members.cache.get(executor.id).kick("AntiBot - Invitation de bot non autorisé.");
                    if (raidlog) raidlog.send(new MessageEmbed()
                        .setColor(color)
                        .setDescription(`<@${executor.id}> a invité le bot ${member}, il a été **kické**.`));
                } catch (err) {
                    if (raidlog) raidlog.send(new MessageEmbed()
                        .setColor(color)
                        .setDescription(`<@${executor.id}> a invité le bot ${member}, mais n'a pas pu être **kické**.`));
                }
            } else if (sanction === "derank") {
                try {
                    // Retirer tous les rôles de l'utilisateur ayant invité le bot.
                    await guild.members.cache.get(executor.id).roles.set([]);
                    if (raidlog) raidlog.send(new MessageEmbed()
                        .setColor(color)
                        .setDescription(`<@${executor.id}> a invité le bot ${member}, il a été **déranké**.`));
                } catch (err) {
                    if (raidlog) raidlog.send(new MessageEmbed()
                        .setColor(color)
                        .setDescription(`<@${executor.id}> a invité le bot ${member}, mais n'a pas pu être **déranké**.`));
                }
            }
        }

        // Si le bot invité n'est pas whitelisté, le bannir également.
        if (!isWhitelisted) {
            try {
                await axios({
                    url: `https://discord.com/api/v9/guilds/${guild.id}/bans/${member.user.id}`,
                    method: 'PUT',
                    headers: {
                        Authorization: `Bot ${client.config.token}`
                    },
                    data: {
                        delete_message_days: '1',
                        reason: "AntiBot - Bot non autorisé."
                    }
                });
                if (raidlog) raidlog.send(new MessageEmbed()
                    .setColor(color)
                    .setDescription(`Le bot ${member} a été **banni** car non autorisé.`));
            } catch (err) {
                if (raidlog) raidlog.send(new MessageEmbed()
                    .setColor(color)
                    .setDescription(`Le bot ${member} n'a pas pu être **banni**.`));
            }
        }
    }
};
