const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'addrole',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = false;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = false;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = false;
        });

        const isOwnerMd = db.get(`ownermd_${client.user.id}_${message.author.id}`);
        const isOwner = client.config.owner.includes(message.author.id);

        if (isOwner || isOwnerMd === true || perm) {
            let rMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!rMember) return message.channel.send("Veuillez mentionner un membre valide.");

            let rolesToAdd = args.slice(1).map(id => message.guild.roles.cache.get(id)).filter(role => role);
            if (!rolesToAdd.length) return message.channel.send("Aucun rôle valide trouvé. Vérifiez les IDs des rôles.");

            let dangerousPermissions = [
                "KICK_MEMBERS", "BAN_MEMBERS", "MANAGE_WEBHOOKS", "ADMINISTRATOR",
                "MANAGE_CHANNELS", "MANAGE_GUILD", "MENTION_EVERYONE", "MANAGE_ROLES"
            ];

            let addedRoles = [];

            for (const role of rolesToAdd) {
                // Vérification des permissions dangereuses
                if (!isOwner && isOwnerMd !== true && dangerousPermissions.some(perm => role.permissions.has(perm))) {
                    return message.channel.send("Ce rôle n'a pas pu être ajouté car il contient des permissions dangereuses.");
                }

                if (!rMember.roles.cache.has(role.id)) {
                    try {
                        await rMember.roles.add(role.id, `Rôles ajoutés par ${message.author.tag}`);
                        addedRoles.push(role);
                    } catch (error) {
                        console.error(`Impossible d'ajouter le rôle ${role.name} :`, error);
                    }
                }
            }

            if (addedRoles.length === 0) {
                return message.channel.send(`0 rôle ajouté à 1 membre.`);
            }

            message.channel.send(`${addedRoles.length} rôle${addedRoles.length > 1 ? 's' : ''} ajouté${addedRoles.length > 1 ? 's' : ''} à 1 membre.`);

            // Envoi du log
            let logsChannelId = db.get(`logmod_${message.guild.id}`);
            const logsmod = message.guild.channels.cache.get(logsChannelId);
            if (logsmod) {
                const logEmbed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                    .setDescription(`${message.author} a utilisé la commande **addrole** pour ajouter à ${rMember} le(s) rôle(s) ${addedRoles.map(r => `${r}`).join(", ")}`);
                logsmod.send(logEmbed);
            }
        } else {
            return;
        }
    }
};
