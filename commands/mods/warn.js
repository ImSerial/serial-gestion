const { MessageEmbed } = require("discord.js");
const db = require("quick.db");
const { MessageActionRow, MessageButton } = require('discord-buttons');
const random_string = require("randomstring");

module.exports = {
    name: 'warn',
    aliases: ["sanctions", "sanction", "warns" ,"averto"],
    run: async (client, message, args, prefix, color) => {

        let logChannelId = db.get(`logmod_${message.guild.id}`);
        const logsChannel = message.guild.channels.cache.get(logChannelId);

        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (!(client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm)) {
            return;
        }

        if (args[0] === "add") {
            const user = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
            if (!user) return message.channel.send(`Aucun membre trouvé pour \`${args[1] || "rien"}\``);

            // **Vérifications des restrictions**
            if (user.id === message.author.id) return message.channel.send("Vous ne pouvez pas vous warn vous-même.");
            if (user.user.bot) return message.channel.send("Vous ne pouvez pas warn un bot.");
            if (client.config.owner.includes(user.id)) return message.channel.send("Vous ne pouvez pas warn un owner config.");

            // **Hiérarchie des rôles**
            let isModsp = message.member.roles.cache.some(role => db.get(`modsp_${message.guild.id}_${role.id}`));
            let isAdmin = message.member.roles.cache.some(role => db.get(`admin_${message.guild.id}_${role.id}`));
            let isOwnerp = message.member.roles.cache.some(role => db.get(`ownerp_${message.guild.id}_${role.id}`));
            let isOwnerConfig = client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;

            let targetModsp = user.roles.cache.some(role => db.get(`modsp_${message.guild.id}_${role.id}`));
            let targetAdmin = user.roles.cache.some(role => db.get(`admin_${message.guild.id}_${role.id}`));
            let targetOwnerp = user.roles.cache.some(role => db.get(`ownerp_${message.guild.id}_${role.id}`));
            let targetOwnerConfig = client.config.owner.includes(user.id) || db.get(`ownermd_${client.user.id}_${user.id}`) === true;

            if (isModsp && (targetModsp || targetAdmin || targetOwnerp || targetOwnerConfig)) {
                return message.channel.send("Vous ne pouvez pas **warn un utilisateur ayant un rôle égal ou supérieur au vôtre.**");
            }

            if (isAdmin && (targetAdmin || targetOwnerp || targetOwnerConfig)) {
                return message.channel.send("Vous ne pouvez pas **warn un owner ou un autre admin.**");
            }

            if (isOwnerp && targetOwnerConfig) {
                return message.channel.send("Vous ne pouvez pas **warn un owner config.**");
            }

            let reason = args.slice(2).join(" ") || "Aucune raison fournie.";
            let warnID = random_string.generate({ charset: 'numeric', length: 8 });

            db.push(`info.${message.guild.id}.${user.id}`, {
                moderator: message.author.tag,
                reason: reason,
                date: Date.parse(new Date) / 1000,
                id: warnID
            });
            db.add(`number.${message.guild.id}.${user.id}`, 1);

            await message.channel.send(`${user} a été **warn** pour \`${reason}\``);
            await user.send(`Vous avez été **warn** sur ${message.guild.name} pour \`${reason}\``).catch(() => {});

            if (logsChannel) {
                logsChannel.send(new MessageEmbed()
                    .setColor(color)
                    .setDescription(`${message.author} a **warn** ${user} pour \`${reason}\``)
                );
            }
        }

        if (args[0] === "list") {
            const user = message.mentions.users.first() || client.users.cache.get(args[1]) || message.author;
            if (!user) return message.channel.send(`Aucun membre trouvé pour \`${args[1]}\``);

            const warnInfo = db.fetch(`info.${message.guild.id}.${user.id}`);
            const number = db.fetch(`number.${message.guild.id}.${user.id}`);

            if (!warnInfo || warnInfo.length === 0) return message.channel.send(`Aucun avertissement trouvé pour \`${args[1] || "rien"}\``);

            let p0 = 0, p1 = 5, page = 1;
            const embed = new MessageEmbed()
                .setTitle(`Sanctions de ${user.username} • Total : (**${number}**)`)
                .setDescription(warnInfo.map((m, i) => `${i + 1}) ID: __${m.id}__ • Staff: __${m.moderator}__ • Raison: __${m.reason}__ • Date: <t:${m.date}>`).slice(p0, p1))
                .setFooter(`${page}/${Math.ceil(number === 0 ? 1 : number / 5)} • ${client.config.name}`)
                .setColor(color);

            message.channel.send(embed);
        }

        if (args[0] === "remove") {
            const user = message.mentions.users.first() || client.users.cache.get(args[1]);
            if (!user) return message.channel.send(`Aucun membre trouvé pour \`${args[1] || "rien"}\``);
            
            let id = args[2];
            if (!id) return message.channel.send("Vous devez fournir l'ID de la sanction à supprimer.");
        
            let database = db.get(`info.${message.guild.id}.${user.id}`);
            if (!database || database.length === 0) return message.channel.send(`Aucun avertissement trouvé pour cet utilisateur.`);
            
            let warnIndex = database.findIndex(data => String(data.id) === String(id));
            if (warnIndex === -1) return message.channel.send(`Aucune sanction trouvée avec l'ID \`${id}\`.`);
            
            database.splice(warnIndex, 1);
        
            if (database.length > 0) {
                db.set(`info.${message.guild.id}.${user.id}`, database);
                db.subtract(`number.${message.guild.id}.${user.id}`, 1);
            } else {
                db.delete(`info.${message.guild.id}.${user.id}`);
                db.delete(`number.${message.guild.id}.${user.id}`);
            }
        
            message.channel.send(`L'avertissement avec l'ID \`${id}\` a été supprimé pour ${user}.`);
        }        

        if (args[0] === "clear") {
            const user = message.mentions.users.first() || client.users.cache.get(args[1]);
            if (!user) return message.channel.send(`Aucun membre trouvé pour \`${args[1] || "rien"}\``);

            const number = db.fetch(`number.${message.guild.id}.${user.id}`);
            if (!number) return message.channel.send(`Aucune sanction trouvée.`);

            message.channel.send(`${number} sanction(s) ont été supprimées`);
            db.delete(`number.${message.guild.id}.${user.id}`);
            db.delete(`info.${message.guild.id}.${user.id}`);
        }
    }
};
