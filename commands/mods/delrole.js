const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'delrole',
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

            let rolesToRemove = args.slice(1).map(id => message.guild.roles.cache.get(id)).filter(role => role);
            if (!rolesToRemove.length) return message.channel.send("Aucun rôle valide trouvé. Vérifiez les IDs des rôles.");

            let dangerousPermissions = [
                "KICK_MEMBERS", "BAN_MEMBERS", "MANAGE_WEBHOOKS", "ADMINISTRATOR",
                "MANAGE_CHANNELS", "MANAGE_GUILD", "MENTION_EVERYONE", "MANAGE_ROLES"
            ];

            let removedRoles = [];

            for (const role of rolesToRemove) {
                // Vérification des permissions dangereuses
                if (!isOwner && isOwnerMd !== true && dangerousPermissions.some(perm => role.permissions.has(perm))) {
                    return message.channel.send("Ce rôle n'a pas pu être supprimé car il contient des permissions dangereuses.");
                }

                if (rMember.roles.cache.has(role.id)) {
                    try {
                        await rMember.roles.remove(role.id, `Rôle retiré par ${message.author.tag}`);
                        removedRoles.push(role);
                    } catch (error) {
                        console.error(`Impossible de retirer le rôle ${role.name} :`, error);
                    }
                }
            }

            if (removedRoles.length === 0) {
                return message.channel.send(`0 rôle retiré de 1 membre.`);
            }

            message.channel.send(`${removedRoles.length} rôle${removedRoles.length > 1 ? 's' : ''} retiré${removedRoles.length > 1 ? 's' : ''} de 1 membre.`);

            // Envoi du log
            let logsChannelId = db.get(`logmod_${message.guild.id}`);
            const logsmod = message.guild.channels.cache.get(logsChannelId);
            if (logsmod) {
                const logEmbed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                    .setDescription(`${message.author} a utilisé la commande **delrole** pour retirer à ${rMember} le(s) rôle(s) ${removedRoles.map(r => `${r}`).join(", ")}`);
                logsmod.send(logEmbed);
            }
        } else {
            return;
        }
    }
};
