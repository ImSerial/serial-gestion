const Discord = require("discord.js");
const db = require('quick.db');
const canvacord = require("canvacord");

module.exports = {
    name: 'level',
    aliases: ["rank"],
    run: async (client, message, args, prefix, color) => {
        let perm = message.member.roles.cache.some(role =>
            db.get(`modsp_${message.guild.id}_${role.id}`) ||
            db.get(`ownerp_${message.guild.id}_${role.id}`) ||
            db.get(`admin_${message.guild.id}_${role.id}`)
        );

        if(client.config.owner.includes(message.author.id) || 
           db.get(`ownermd_${client.user.id}_${message.author.id}`) || 
           perm || 
           db.get(`channelpublic_${message.guild.id}_${message.channel.id}`)) { 

            const use = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
            const member = message.guild.members.cache.get(use.id) || message.member;

            // Log pour vérifier l'objet utilisateur
            console.log(member.user); // Déboguer l'objet utilisateur

            const members = [...message.guild.members.cache
                .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
                .values()];
            const position = members.findIndex(m => m.id === member.id) + 1;

            var level = db.get(`guild_${message.guild.id}_level_${member.id}`) || 0;
            let xp = db.get(`guild_${message.guild.id}_xp_${member.id}`) || 0;
            var xpNeeded = level * 500 + 500;

            const discriminator = member.user.discriminator === '0' ? '0000' : member.user.discriminator; // Remplacer le discriminant '0' par '0000'

            const rank = new canvacord.Rank()
                .setUsername(member.user.username)
                .setDiscriminator(discriminator) // Utilisation du discriminant modifié
                .setStatus(member.presence?.status || "offline")
                .setCurrentXP(xp)
                .setRequiredXP(xpNeeded)
                .setLevel(level)
                .setRank(position)
                .setAvatar(member.user.displayAvatarURL({ format: 'png' }))
                .setRankColor('white');

            rank.build().then(async datae => {
                const attachment = new Discord.MessageAttachment(datae, "RankCard.png");
                const embed = new Discord.MessageEmbed()
                    .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
                    .setColor(color)
                    .setDescription(`${member}
**Vocal:** \`${duration(db.get(`vocalrank_${message.guild.id}_${member.id}`) || 0)}\`
**Messages:** \`${db.get(`msg_${message.guild.id}_${member.id}`) || 0}\``)
                    .setImage("attachment://RankCard.png");

                message.channel.send({ embeds: [embed], files: [attachment] });
            }).catch(console.error);
        }
    }
}

// Fonction de conversion de durée
function duration(mss) {
    const sec = Math.floor((mss / 1000) % 60).toString();
    const min = Math.floor((mss / (1000 * 60)) % 60).toString();
    const hrs = Math.floor((mss / (1000 * 60 * 60)) % 24).toString();
    const days = Math.floor(mss / (1000 * 60 * 60 * 24)).toString();
    return `${days > 0 ? `${days} jours, ` : ""}${hrs > 0 ? `${hrs} heures, ` : ""}${min > 0 ? `${min} minutes et ` : ""}${sec} secondes`;
}
