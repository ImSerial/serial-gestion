const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'unmute',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let chx = db.get(`logmod_${message.guild.id}`);
        const logschannel = message.guild.channels.cache.get(chx);

        if (args[0] === "all") {
            let perm = false;
            message.member.roles.cache.forEach(role => {
                if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
                if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
            });

            if (!perm && !client.config.owner.includes(message.author.id) && !db.get(`ownermd_${client.user.id}_${message.author.id}`)) {
                return;
            }

            let Muted = db.fetch(`mRole_${message.guild.id}`);
            let muteRole = message.guild.roles.cache.get(Muted) ||
                message.guild.roles.cache.find(role => role.name.toLowerCase().includes('mute'));

            if (!muteRole) return message.channel.send(`Je ne trouve pas le rôle **muet**.`);
            const mutedMembers = muteRole.members;

            if (mutedMembers.size === 0) {
                return message.channel.send(`Aucun membre n'est actuellement mute.`);
            }

            mutedMembers.forEach(member => {
                member.send(`Vous avez été **unmute** de ${message.guild.name}`).catch(() => {});
                member.roles.remove(muteRole.id).catch(() => {});
                db.set(`mute_${message.guild.id}_${member.user.id}`, false);
            });

            const memberCount = mutedMembers.size;
            const messageText = memberCount === 1 
                ? `1 membre a été **unmute.**` 
                : `${memberCount} membres ont été **unmute.**`;

            message.channel.send(messageText);
        } else if (args[0]) {
            let perm = false;
            message.member.roles.cache.forEach(role => {
                if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
                if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
                if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            });

            if (!perm && !client.config.owner.includes(message.author.id) && !db.get(`ownermd_${client.user.id}_${message.author.id}`)) {
                return;
            }

            const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

            if (!user) {
                return message.channel.send(`Aucun membre trouvé pour \`${args[0]}\`.`);
            }

            let Muted = db.fetch(`mRole_${message.guild.id}`);
            let muterole = message.guild.roles.cache.get(Muted) ||
                message.guild.roles.cache.find(role => role.name.toLowerCase().includes('mute'));

            if (!muterole) return message.channel.send(`Erreur : aucun rôle muet enregistré.`);
            if (!user.roles.cache.has(muterole.id)) {
                return message.channel.send(`${user} n'était pas mute.`);
            }

            user.roles.remove(muterole, `Unmute par ${message.author.tag}`);
            message.channel.send(`${user} a été **unmute**.`);
            db.set(`mute_${message.guild.id}_${user.id}`, null);

            user.send(`Vous avez été **unmute** sur **${message.guild.name}**.`).catch(() => {});

            if (logschannel) {
                logschannel.send(new Discord.MessageEmbed()
                    .setColor(color)
                    .setDescription(`${message.author} a **unmute** ${user}`)
                );
            }
        }
    }
};
