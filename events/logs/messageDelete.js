const axios = require('axios');
const db = require("quick.db");
const Discord = require("discord.js");
const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'] // Activer les partials pour récupérer les messages supprimés
});
const ms = require("ms");

module.exports = (client, message) => {

    let guild = message.guild;
    const color = db.get(`color_${guild.id}`) === null ? client.config.color : db.get(`color_${guild.id}`);
    let wass = db.get(`msglog_${message.guild.id}`);
    const logschannel = message.guild.channels.cache.get(wass);

    // Si un canal de log est défini
    if (logschannel) {
        // Vérifier si le message est partiel et essayer de le récupérer
        if (message.partial) {
            message.fetch().catch(err => {
                console.error('Impossible de récupérer le message supprimé :', err);
                return; // Si le fetch échoue, on arrête l'exécution
            });
        }

        // Si le message est validé, on continue
        if (!message || !message.author) {
            console.error('Message ou auteur non disponible, annulation du traitement.');
            return; // Si le message ou l'auteur est invalide, on annule le traitement
        }

        const embedLog = new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor(`${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(`**Message supprimé dans** <#${message.channel.id}>`)
            .setTimestamp();

        if (message.content) {
            embedLog.addField('Contenu :', message.content, false);
        } else {
            embedLog.addField('Contenu :', 'Aucun contenu (message vide)', false);
        }

        logschannel.send(embedLog).then(sentLogMessage => {
            if (message.embeds.length > 0) {
                message.embeds.forEach(embedMsg => {
                    const recreatedEmbed = new Discord.MessageEmbed()
                        .setColor(embedMsg.color || color)
                        .setTitle(embedMsg.title || '')
                        .setURL(embedMsg.url || '')
                        .setDescription(embedMsg.description || '')
                        .setThumbnail(embedMsg.thumbnail ? embedMsg.thumbnail.url : null)
                        .setImage(embedMsg.image ? embedMsg.image.url : null)
                        .setFooter(embedMsg.footer ? embedMsg.footer.text : '', embedMsg.footer ? embedMsg.footer.iconURL : '')
                        .setAuthor(embedMsg.author ? embedMsg.author.name : '', embedMsg.author ? embedMsg.author.iconURL : '', embedMsg.author ? embedMsg.url : '')
                        .setTimestamp(embedMsg.timestamp ? new Date(embedMsg.timestamp) : undefined);

                    if (embedMsg.fields.length > 0) {
                        embedMsg.fields.forEach(field => {
                            recreatedEmbed.addField(field.name, field.value, field.inline);
                        });
                    }

                    logschannel.send(recreatedEmbed).then(sentEmbed => {
                        sentEmbed.react('🔄');

                        const filter = (reaction, user) => reaction.emoji.name === '🔄' && !user.bot;
                        const collector = sentEmbed.createReactionCollector(filter, { max: 1, time: 60000 });

                        collector.on('collect', (reaction, user) => {
                            message.channel.send(recreatedEmbed).then(() => {
                                logschannel.send(`L'embed a été renvoyé par ${user.tag}`);
                            });
                        });
                    });
                });
            }
        });
    }
};
