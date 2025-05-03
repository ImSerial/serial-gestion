const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord-buttons');
const db = require('quick.db'); // Assurez-vous que 'quick.db' est bien installé

module.exports = {
    name: 'booster',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        // Vérification des permissions
        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {
            // Filtrer les membres ayant boosté le serveur
            let boosters = message.guild.members.cache.filter(member => member.premiumSince);

            // Si aucun booster n'a été trouvé
            if (boosters.size === 0) {
                return message.channel.send(
                    new MessageEmbed()
                        .setColor(color)
                        .setTitle("Aucun booster trouvé")
                        .setDescription("Personne n'a boosté ce serveur pour l'instant.")
                        .setThumbnail(message.guild.iconURL({ dynamic: true }))
                        .setTimestamp()
                );
            }

            // Variables de pagination
            let p0 = 0;
            let p1 = 10; // Afficher 10 membres par page
            let page = 1;

            // Créer l'embed initial
            const embed = new MessageEmbed()
                .setTitle('Boosters')
                .setDescription(`Il y a **${boosters.size}** boosters`)
                .addField(
                    'Liste des boosters',
                    boosters
                        .map(member => `${member.user} - <t:${Math.floor(member.premiumSince / 1000)}:F>`) // Mention propre avec timestamp
                        .slice(p0, p1)
                        .join('\n')
                )
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .setColor(color)
                .setFooter(`${page}/${Math.ceil(boosters.size / 10)}`)
                .setTimestamp();

            const msg = await message.channel.send(embed);

            // Vérification de la pagination
            if (boosters.size > 10) {
                const B1 = new MessageButton()
                    .setLabel("◀")
                    .setStyle("gray")
                    .setID('prevPage');

                const B2 = new MessageButton()
                    .setLabel("▶")
                    .setStyle("gray")
                    .setID('nextPage');

                const row = new MessageActionRow().addComponent(B1).addComponent(B2);

                await msg.edit("", { embed, components: [row] });

                const collector = msg.createButtonCollector(b => b.clicker.user.id === message.author.id, { time: 60000 });

                collector.on('collect', async b => {
                    if (b.id === 'prevPage') {
                        if (p0 === 0) return b.reply.defer();
                        p0 -= 10;
                        p1 -= 10;
                        page--;

                        embed.fields[0].value = boosters
                            .map(member => `${member.user} - <t:${Math.floor(member.premiumSince / 1000)}:F>`) // Mention propre avec timestamp
                            .slice(p0, p1)
                            .join('\n');
                        embed.setFooter(`${page}/${Math.ceil(boosters.size / 10)}`);
                        msg.edit(embed);
                        b.reply.defer();
                    }

                    if (b.id === 'nextPage') {
                        if (p1 >= boosters.size) return b.reply.defer();
                        p0 += 10;
                        p1 += 10;
                        page++;

                        embed.fields[0].value = boosters
                            .map(member => `${member.user} - <t:${Math.floor(member.premiumSince / 1000)}:F>`) // Mention propre avec timestamp
                            .slice(p0, p1)
                            .join('\n');
                        embed.setFooter(`${page}/${Math.ceil(boosters.size / 10)}`);
                        msg.edit(embed);
                        b.reply.defer();
                    }
                });

                collector.on('end', () => {
                    msg.edit("", {
                        embed,
                        components: []
                    });
                });
            }
        } else {
            // Aucune action ici pour les utilisateurs sans permissions
            return; 
        }
    }
};
