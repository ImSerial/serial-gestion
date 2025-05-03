const axios = require('axios');
const db = require("quick.db");
const Discord = require("discord.js");
const ms = require("ms");

module.exports = async (client, oldMessage, newMessage) => {

    let guild = oldMessage.guild;
    const color = db.get(`color_${guild.id}`) === null ? client.config.color : db.get(`color_${guild.id}`);
    let wass = db.get(`msglog_${oldMessage.guild.id}`);
    const logschannel = oldMessage.guild.channels.cache.get(wass);

    // Si un canal de log est défini
    if (logschannel) {
        const embed = new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor(`${member.user.username}`, member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`**Message édité par** ${oldMessage.author} dans <#${oldMessage.channel.id}>`)
            .addField('Avant :', oldMessage.content || 'Aucun contenu (message vide)', false)
            .addField('Après :', newMessage.content || 'Aucun contenu (message vide)', false)
            .setTimestamp(); // Ajoute un timestamp pour l'édition

        // Si le message avant ou après modification a des pièces jointes
        if (oldMessage.attachments.size > 0 || newMessage.attachments.size > 0) {
            const oldFiles = oldMessage.attachments.map(attachment => attachment.url).join('\n');
            const newFiles = newMessage.attachments.map(attachment => attachment.url).join('\n');
            if (oldFiles !== newFiles) {
                embed.addField('Pièces jointes avant / après', `Avant :\n${oldFiles || 'Aucune'}\nAprès :\n${newFiles || 'Aucune'}`);
            }
        }

        // Si le message avant ou après modification a des mentions d'utilisateurs
        if (oldMessage.mentions.users.size > 0 || newMessage.mentions.users.size > 0) {
            const oldMentions = oldMessage.mentions.users.map(user => user.tag).join(', ');
            const newMentions = newMessage.mentions.users.map(user => user.tag).join(', ');
            if (oldMentions !== newMentions) {
                embed.addField('Mentions utilisateurs avant / après', `Avant :\n${oldMentions || 'Aucune'}\nAprès :\n${newMentions || 'Aucune'}`);
            }
        }

        // Si le message avant ou après modification a des mentions de rôles
        if (oldMessage.mentions.roles.size > 0 || newMessage.mentions.roles.size > 0) {
            const oldRoleMentions = oldMessage.mentions.roles.map(role => role.name).join(', ');
            const newRoleMentions = newMessage.mentions.roles.map(role => role.name).join(', ');
            if (oldRoleMentions !== newRoleMentions) {
                embed.addField('Mentions de rôles avant / après', `Avant :\n${oldRoleMentions || 'Aucune'}\nAprès :\n${newRoleMentions || 'Aucune'}`);
            }
        }

        // Si le message avant ou après modification a des réactions
        if (oldMessage.reactions.cache.size > 0 || newMessage.reactions.cache.size > 0) {
            const oldReactions = oldMessage.reactions.cache.map(reaction => `${reaction.emoji.name} (${reaction.count} réactions)`).join('\n');
            const newReactions = newMessage.reactions.cache.map(reaction => `${reaction.emoji.name} (${reaction.count} réactions)`).join('\n');
            if (oldReactions !== newReactions) {
                embed.addField('Réactions avant / après', `Avant :\n${oldReactions || 'Aucune'}\nAprès :\n${newReactions || 'Aucune'}`);
            }
        }

        // Gestion des embeds dans les messages (avant / après)
        if (oldMessage.embeds.length > 0 || newMessage.embeds.length > 0) {
            oldMessage.embeds.forEach(embedMsg => {
                embed.addField('Embed avant', `Description : \n${embedMsg.description || 'Aucune description'}\n` +
                    `Couleur : ${embedMsg.color ? `#${embedMsg.color.toString(16)}` : 'Aucune'}\n` +
                    `URL : ${embedMsg.url || 'Aucune URL'}`);
            });
            newMessage.embeds.forEach(embedMsg => {
                embed.addField('Embed après', `Description : \n${embedMsg.description || 'Aucune description'}\n` +
                    `Couleur : ${embedMsg.color ? `#${embedMsg.color.toString(16)}` : 'Aucune'}\n` +
                    `URL : ${embedMsg.url || 'Aucune URL'}`);
            });
        }

        // Envoi de l'embed dans le canal de logs
        logschannel.send(embed);
    }
};
