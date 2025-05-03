const Discord = require('discord.js');
const db = require('quick.db');
const {
    MessageActionRow,
    MessageButton
} = require('discord-buttons');

module.exports = {
    name: 'owner',
    aliases: [],
    run: async (client, message, args, prefix, color) => {

        // Vérifie si l'utilisateur est un owner configuré
        if (client.config.owner.includes(message.author.id)) {

            // ====================== Ajouter un owner =======================
            if (args[0] === "add") {
                let member = client.users.cache.get(message.author.id);
                
                if (args[1]) {
                    member = client.users.cache.get(args[1]);
                } else {
                    return message.channel.send(`Aucun membre trouvé pour \`${args[1] || " "}\``);
                }

                if (message.mentions.members.first()) {
                    member = client.users.cache.get(message.mentions.members.first().id);
                }

                if (!member) {
                    return message.channel.send(`Aucun membre trouvé pour \`${args[1] || " "}\``);
                }

                if (db.get(`ownermd_${client.user.id}_${member.id}`)) {
                    return message.channel.send(`**${member.tag}** est déjà présent dans la liste owner.`);
                }

                db.set(`ownermd_${client.user.id}_${member.id}`, true);
                return message.channel.send(`**${member.tag}** est maintenant dans la liste owner.`);

            // ====================== Supprimer tous les owners =======================
            } else if (args[0] === "clear") {
                let owners = db.all().filter(data => data.ID.startsWith(`ownermd_${client.user.id}`));

                message.channel.send(`**${owners.length || 0}** ${owners.length > 1 ? "personnes ont été supprimées" : "personne a été supprimée"} des owners.`);

                for (let owner of owners) {
                    db.delete(owner.ID);
                }

            // ====================== Supprimer un owner spécifique =======================
            } else if (args[0] === "remove") {
                let member = client.users.cache.get(message.author.id);

                if (args[1]) {
                    member = client.users.cache.get(args[1]);
                }

                if (message.mentions.members.first()) {
                    member = client.users.cache.get(message.mentions.members.first().id);
                }

                if (!member) {
                    return message.channel.send(`Aucun membre trouvé pour \`${args[1] || " "}\``);
                }

                if (!db.get(`ownermd_${client.user.id}_${member.id}`)) {
                    return message.channel.send(`**${member.tag}** n'est pas présent dans la liste owner.`);
                }

                db.delete(`ownermd_${client.user.id}_${member.id}`);
                return message.channel.send(`**${member.tag}** n'est plus dans la liste owner.`);

            // ====================== Lister tous les owners =======================
            } else if (args[0] === "list") {
                let owners = db.all()
                    .filter(data => data.ID.startsWith(`ownermd_${client.user.id}`))
                    .sort((a, b) => b.data - a.data);

                let page = 1;
                let itemsPerPage = 5;
                let totalPages = Math.ceil(owners.length / itemsPerPage) || 1;

                const embed = new Discord.MessageEmbed()
                    .setTitle('Liste des Owners')
                    .setDescription(
                        owners
                            .filter(x => client.users.cache.get(x.ID.split('_')[2]))
                            .map((entry, index) => {
                                const user = client.users.cache.get(entry.ID.split('_')[2]);
                                return `${index + 1}) <@${user.id}> (${user.id})`;
                            })
                            .slice(0, itemsPerPage)
                            .join('\n')
                    )
                    .setFooter(`${page}/${totalPages} • ${client.config.name}`)
                    .setColor(color);

                const messageInstance = await message.channel.send(embed);

                if (owners.length > itemsPerPage) {
                    const buttonPrevious = new MessageButton()
                        .setLabel("◀")
                        .setStyle("gray")
                        .setID('owner_previous');

                    const buttonNext = new MessageButton()
                        .setLabel("▶")
                        .setStyle("gray")
                        .setID('owner_next');

                    const actionRow = new MessageActionRow()
                        .addComponent(buttonPrevious)
                        .addComponent(buttonNext);

                    messageInstance.edit({ embed, components: [actionRow] });

                    let currentPage = 0;

                    const updateEmbed = (page) => {
                        embed.setDescription(
                            owners
                                .filter(x => client.users.cache.get(x.ID.split('_')[2]))
                                .map((entry, index) => {
                                    const user = client.users.cache.get(entry.ID.split('_')[2]);
                                    return `${index + 1}) <@${user.id}> (${user.id})`;
                                })
                                .slice(page * itemsPerPage, (page + 1) * itemsPerPage)
                                .join('\n')
                        )
                        .setFooter(`${page + 1}/${totalPages} • ${client.config.name}`);

                        messageInstance.edit({ embed });
                    };

                    client.on("clickButton", async (button) => {
                        if (button.clicker.user.id !== message.author.id) return;
                        button.reply.defer(true);

                        if (button.id === "owner_previous" && currentPage > 0) {
                            currentPage--;
                            updateEmbed(currentPage);
                        } else if (button.id === "owner_next" && currentPage < totalPages - 1) {
                            currentPage++;
                            updateEmbed(currentPage);
                        }
                    });
                }
            }
        }
    }
};
