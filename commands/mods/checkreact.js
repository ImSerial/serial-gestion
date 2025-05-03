const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: "checkreact",
    aliases: [],

    run: async (client, message, args, prefix, color) => {
        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`admin_${message.guild.id}_${role.id}`) || db.get(`ownerp_${message.guild.id}_${role.id}`)) {
                perm = false;
                return;
            }
        });

        // Vérification des permissions
        if (!client.config.owner.includes(message.author.id) && 
            db.get(`ownermd_${client.user.id}_${message.author.id}`) !== true && 
            !perm) {
            return;
        }

        // Vérification des arguments
        const isPing = args[0] === "ping"; 
        const roleArg = isPing ? args[1] : args[0];
        const messageId = isPing ? args[2] : args[1];

        if (!roleArg) return message.channel.send("**T'es con ou quoi fdp mentionne un rôle connard va**");
        if (!messageId) return message.channel.send("**Fournis L'id du message FDP va !**");

        // Récupération du rôle
        let role = message.mentions.roles.first() || message.guild.roles.cache.get(roleArg);
        if (!role) return message.channel.send("**Rôle introuvable. FDP**");

        // Recherche du message dans tous les salons
        let msg;
        for (const [_, channel] of message.guild.channels.cache) {
            if (channel.type === "text") {
                try {
                    msg = await channel.messages.fetch(messageId);
                    if (msg) break;
                } catch (err) {
                    continue;
                }
            }
        }

        if (!msg) return message.channel.send("**Message introuvable**");
        if (!msg.reactions.cache.size) return message.channel.send("**Le message ne contient aucune réaction**");

        // Récupération des membres ayant le rôle
        const membersWithRole = message.guild.members.cache.filter(member => member.roles.cache.has(role.id));
        let reactedUsers = new Map();
        let notReacted = new Set(membersWithRole.keys());

        // Récupération et vérification des réactions
        await Promise.all(msg.reactions.cache.map(async reaction => {
            try {
                let users = await reaction.users.fetch();
                let emojiName = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;

                users.forEach(user => {
                    if (!reactedUsers.has(emojiName)) reactedUsers.set(emojiName, []);
                    reactedUsers.get(emojiName).push(`*${user.username}*`);
                    notReacted.delete(user.id);
                });
            } catch (err) {
                console.error(`[ERREUR CHECKREACT] Impossible de récupérer les réactions :`, err);
            }
        }));

        // Si "ping" est activé, mentionner ceux qui n'ont pas réagi
        if (isPing) {
            if (notReacted.size === 0) {
                return message.channel.send("**Tous les membres du rôle donné ont réagi**");
            }

            let mentions = Array.from(notReacted)
                .map(id => `<@${id}>`)
                .join(" ");

            return message.channel.send(`**Certains membres n'ont pas encore réagi :**\n${mentions}`);
        }

        // Création de l'embed
        const embed = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle(`📊 Réactions pour le rôle ${role.name}`)
            .setTimestamp();

        // Ajout des utilisateurs ayant réagi
        reactedUsers.forEach((users, emoji) => {
            embed.addField(`${emoji} A réagi`, users.length ? users.join("\n") : "Aucun", true);
        });

        // Ajout des utilisateurs n'ayant pas réagi
        if (notReacted.size > 0) {
            let notReactedList = Array.from(notReacted)
                .map(id => {
                    let member = message.guild.members.cache.get(id);
                    return member ? `*${member.user.username}*` : null;
                })
                .filter(Boolean);

            embed.addField("🚫 Pas encore réagi", notReactedList.length ? notReactedList.join("\n") : "Aucun", false);
        }

        message.channel.send(embed);
    }
};
