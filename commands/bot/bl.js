const Discord = require('discord.js');
const db = require('quick.db');
const {
    MessageActionRow,
    MessageButton
} = require('discord-buttons');

module.exports = {
    name: 'blacklist',
    aliases: ["bl", "listenoire"],
    run: async (client, message, args, prefix, color) => {

        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true) {

            if (args[0] === "add") {
                let member = client.users.cache.get(args[1]) || message.mentions.users.first();
                if (!member) return message.channel.send(`Aucun membre trouvé pour \`${args[1] || "rien"}\``);
                if (db.get(`blmd_${client.user.id}_${member.id}`)) return message.channel.send(`**${member.tag}** est déjà dans la blacklist`);

                let nmb = 0, nmbe = 0;
                client.guilds.cache.forEach(g => {
                    let m = g.members.cache.get(member.id);
                    if (m) {
                        m.ban().then(() => nmb++).catch(() => nmbe++);
                    }
                });

                db.set(`blmd_${client.user.id}_${member.id}`, true);
                message.channel.send(`**${member.tag}** a été ajouté à la blacklist.\nIl a été **ban** de **${nmb}** serveur(s)\nJe n'ai pas pu le **ban** de **${nmbe}** serveur(s)`);
            }

            else if (args[0] === "remove") {
                let member = client.users.cache.get(args[1]) || message.mentions.users.first();
                if (!member) return message.channel.send(`Aucun membre trouvé pour \`${args[1] || "rien"}\``);
                if (!db.get(`blmd_${client.user.id}_${member.id}`)) return message.channel.send(`**${member.tag}** n'est pas dans la blacklist`);

                db.delete(`blmd_${client.user.id}_${member.id}`);
                message.channel.send(`**${member.tag}** a été retiré de la blacklist.`);
            }

            else if (args[0] === "clear") {
                let entries = db.all().filter(data => data.ID.startsWith(`blmd_${client.user.id}_`));
                entries.forEach(entry => db.delete(entry.ID));
                message.channel.send(`**${entries.length}** utilisateur(s) retiré(s) de la blacklist.`);
            }

            else if (args[0] === "list") {
                let data = db.all().filter(d => d.ID.startsWith(`blmd_${client.user.id}_`));
                let users = data.map(d => client.users.cache.get(d.ID.split('_')[2])).filter(Boolean);
                if (users.length === 0) return message.channel.send("La blacklist est vide.");

                let page = 0;
                const itemsPerPage = 10;
                const totalPages = Math.ceil(users.length / itemsPerPage);

                const generateEmbed = () => {
                    const start = page * itemsPerPage;
                    const current = users.slice(start, start + itemsPerPage);

                    return new Discord.MessageEmbed()
                        .setTitle("Blacklist")
                        .setDescription(current.map((user, i) => `${start + i + 1}) <@${user.id}> (${user.id})`).join('\n'))
                        .setFooter(`Page ${page + 1}/${totalPages} • ${client.config.name}`)
                        .setColor(color);
                };

                const backButton = new MessageButton()
                    .setLabel("◀")
                    .setStyle("gray")
                    .setID("bl_prev");

                const nextButton = new MessageButton()
                    .setLabel("▶")
                    .setStyle("gray")
                    .setID("bl_next");

                const row = new MessageActionRow().addComponent(backButton).addComponent(nextButton);

                const msg = await message.channel.send({
                    embed: generateEmbed(),
                    components: users.length > itemsPerPage ? [row] : []
                });

                const collector = client.on("clickButton", async (button) => {
                    if (button.message.id !== msg.id) return;
                    if (button.clicker.user.id !== message.author.id) return button.reply.defer();

                    if (button.id === "bl_prev") {
                        if (page > 0) page--;
                    } else if (button.id === "bl_next") {
                        if (page < totalPages - 1) page++;
                    } else {
                        return;
                    }

                    await button.reply.defer();
                    msg.edit({
                        embed: generateEmbed(),
                        components: [row]
                    });
                });

                setTimeout(() => {
                    msg.edit({
                        embed: generateEmbed(),
                        components: []
                    });
                }, 3 * 60000); // Désactive après 3 minutes
            }
        }
    }
};
