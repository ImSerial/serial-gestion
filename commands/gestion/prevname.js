const Discord = require('discord.js');
const db = require('quick.db');
const { MessageButton, MessageActionRow } = require('discord-buttons');

module.exports = {
    name: 'prevname',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (!client.config.owner.includes(message.author.id) &&
            db.get(`ownermd_${client.user.id}_${message.author.id}`) !== true &&
            !perm &&
            !db.get(`channelpublic_${message.guild.id}_${message.channel.id}`)) {
            return;
        }

        // Gestion de la commande clear
        if (args[0] === 'clear') {
            const target = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || message.member;
            db.delete(`prevnick_${message.guild.id}_${target.id}`);
            return message.channel.send(`Les anciens pseudos de **${target.displayName}** ont été supprimés.`);
        }

        // Récupération de l'utilisateur par mention ou ID
        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

        let prevNames = db.get(`prevnick_${message.guild.id}_${user.id}`) || [];

        // Suppression des doublons
        prevNames = [...new Map(prevNames.map(entry => [entry.nickname, entry])).values()];

        if (prevNames.length === 0) {
            return message.channel.send(`Aucun ancien pseudo trouvé pour **${user.displayName}**.`);
        }

        let description = prevNames
            .map(entry => `<t:${Math.floor(entry.date / 1000)}:F> - **${entry.nickname}**`)
            .join('\n');

        const embed = new Discord.MessageEmbed()
            .setTitle(`Liste des anciens pseudos de ${user.displayName}`)
            .setDescription(description)
            .setColor(color)
            .setFooter(`${prevNames.length}/${prevNames.length} • Crow Bots`);

        const deleteButton = new MessageButton()
            .setStyle('gray')
            .setEmoji('🗑️')
            .setID('deleteMessage');

        const row = new MessageActionRow().addComponents(deleteButton);

        const sentMessage = await message.channel.send({ embed: embed, component: row });

        const filter = (button) => button.clicker.user.id === message.author.id;
        const collector = sentMessage.createButtonCollector(filter, { time: 60000 });

        collector.on('collect', async button => {
            await button.reply.defer();
            if (button.id === 'deleteMessage') {
                sentMessage.delete();
            }
        });
    }
};
