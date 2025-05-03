const Discord = require('discord.js');
const db = require('quick.db');
const {
    MessageActionRow,
    MessageButton,
    MessageMenuOption,
    MessageMenu
} = require('discord-buttons');

module.exports = {
    name: 'derank',
    aliases: [],

    run: async (client, message, args, prefix, color) => {
        let perm = "";
        // Vérifier les permissions de l'utilisateur
        message.member.roles.cache.forEach(role => {
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = null;
        });

        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {

            // Si un ID ou une mention est fournie
            let user = null;
            
            if (args[0]) {
                // Vérifier si l'argument est une mention ou un ID
                if (message.mentions.members.size > 0) {
                    user = message.mentions.members.first(); // Utilisation de la mention
                } else {
                    user = await message.guild.members.fetch(args[0]).catch(() => null); // Utilisation de l'ID
                }

                // Vérifier si l'utilisateur a été trouvé
                if (!user) {
                    return message.channel.send(`Aucun membre trouvé pour \`${args[0] || "rien"}\``);
                }

                // Empêcher le derank de l'auteur du message ou de certains utilisateurs
                if (user.id === message.author.id) {
                    return message.channel.send(`Vous n'avez pas la permission de **derank** *(vous ne pouvez pas vous derank vous même)* <@${user.id}>`);
                }
                if (user.roles.highest.position >= message.member.roles.highest.position) {
                    return message.channel.send(`Vous n'avez pas la permission de **derank** <@${user.id}> *(le membre a un rôle plus élevé que vous)*`);
                }
                if (client.config.owner.includes(user.id)) {
                    return message.channel.send(`Vous n'avez pas la permission de **derank** *(vous ne pouvez pas derank un owner)* <@${user.id}>`);
                }

                // Effectuer l'action de derank (retirer tous les rôles sauf @everyone)
                try {
                    // Retirer tous les rôles sauf @everyone
                    await user.roles.set([], `Derank par ${message.author.tag}`);
                    
                    // Message indiquant que l'utilisateur a été deranké
                    message.channel.send(`${user} a été **derank**.`);

                    // Envoyer un message de log si un canal est configuré pour les logs
                    let wass = db.get(`logmod_${message.guild.id}`);
                    const logschannel = message.guild.channels.cache.get(wass);

                    if (logschannel) {
                        logschannel.send(new Discord.MessageEmbed()
                            .setColor(color)
                            .setDescription(`${message.author} a **derank** ${user.user}`)
                        );
                    }
                } catch (err) {
                    return message.channel.send('Une erreur est survenue lors du **derank** de ce membre.');
                }
            } else {
                return message.channel.send('Veuillez spécifier un utilisateur à **derank**.');
            }

        }
    }
};
