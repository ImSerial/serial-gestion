const Discord = require('discord.js');
const db = require('quick.db');
const { MessageActionRow, MessageButton } = require('discord-buttons');

module.exports = {
    name: 'top',
    aliases: ["leaderboard"],
    run: async (client, message, args, prefix, color) => {
        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (client.config.owner.includes(message.author.id) || 
            db.get(`ownermd_${client.user.id}_${message.author.id}`) || 
            perm || 
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`)) {

            let type = args[0] && (args[0] === "rank" || args[0] === "level") ? "rank" : "invite";

            let data = db.all().filter(entry => 
                entry.ID.startsWith(type === "rank" ? `guild_${message.guild.id}_xp` : `invites_${message.guild.id}`)
            ).sort((a, b) => b.data - a.data);

            let p0 = 0, p1 = 15, page = 1;
            if (data.length === 0) {
                return message.channel.send("Aucune donnée trouvée pour ce classement.");
            }

            const embed = new Discord.MessageEmbed()
                .setTitle(type === "rank" ? 'Classement Rank' : 'Classement Invitations')
                .setColor(color)
                .setDescription(formatLeaderboard(data, message.guild, client, type, p0, p1))
                .setFooter(`${page}/${Math.ceil(data.length / 15)} • ${client.config.name}`);

            message.channel.send(embed).then(async tdata => {
                if (data.length > 15) {
                    const B1 = new MessageButton()
                        .setLabel("◀")
                        .setStyle("gray")
                        .setID(`top_${type}_prev`);

                    const B2 = new MessageButton()
                        .setLabel("▶")
                        .setStyle("gray")
                        .setID(`top_${type}_next`);

                    const row = new MessageActionRow().addComponents(B1, B2);
                    tdata.edit({ embed: embed, components: [row] });

                    const filter = (button) => button.clicker.user.id === message.author.id;
                    const collector = tdata.createButtonCollector(filter, { time: 300000 });

                    collector.on('collect', button => {
                        button.reply.defer();
                        if (button.id === `top_${type}_prev` && p0 > 0) {
                            p0 -= 15;
                            p1 -= 15;
                            page--;
                        } else if (button.id === `top_${type}_next` && p1 < data.length) {
                            p0 += 15;
                            p1 += 15;
                            page++;
                        }
                        embed.setDescription(formatLeaderboard(data, message.guild, client, type, p0, p1))
                             .setFooter(`${page}/${Math.ceil(data.length / 15)} • ${client.config.name}`);
                        tdata.edit({ embed: embed });
                    });
                }
            });
        }
    }
};

function formatLeaderboard(data, guild, client, type, start, end) {
    return data
        .slice(start, end)
        .map((m, i) => {
            let userID = type === "rank" ? m.ID.split('_')[3] : m.ID.split('_')[2];
            let user = client.users.cache.get(userID) || { tag: "Utilisateur inconnu" };
            if (type === "rank") {
                return `${i + 1 + start}) **${user.tag}** : Niveau **${db.get(`guild_${guild.id}_level_${userID}`) || 0}** (*XP total : ${m.data || 0}*)`;
            } else {
                return `${i + 1 + start}) **${user.tag}** : **${m.data || 0}** invitations (**${db.fetch(`Regular_${guild.id}_${userID}`) || 0}** joins, **${db.fetch(`leaves_${guild.id}_${userID}`) || 0}** leaves, **0** bonus)`;
            }
        }).join("\n");
}
