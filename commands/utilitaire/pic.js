const Discord = require('discord.js');
const disbut = require('discord-buttons'); // Importer discord-buttons
const db = require('quick.db'); // Assurez-vous que quick.db est installé

module.exports = {
    name: 'pic',
    aliases: ['pp', 'avatar'],
    run: async (client, message, args, prefix, color) => {
        let perm = "";
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm || db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true) {
            let user;

            // Récupération de l'utilisateur ciblé
            if (message.mentions.users.size > 0) {
                user = message.mentions.users.first();
            } else if (args[0]) {
                try {
                    user = await client.users.fetch(args[0]);
                } catch (error) {
                    return message.channel.send('Utilisateur introuvable.');
                }
            } else {
                user = message.author;
            }

            // URL de l'avatar de l'utilisateur
            const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
            const isGif = avatarURL.endsWith('.gif'); // Vérifie si l'avatar est un GIF

            // Créer une rangée de boutons de téléchargement
            const row = new disbut.MessageActionRow()
                .addComponents(
                    new disbut.MessageButton()
                        .setLabel('Télécharger en .png')
                        .setStyle('url')
                        .setURL(avatarURL.replace(/\.webp|\.gif/, '.png')),

                    new disbut.MessageButton()
                        .setLabel('Télécharger en .webp')
                        .setStyle('url')
                        .setURL(avatarURL.replace(/\.png|\.gif/, '.webp'))
                );

            // Si l'avatar est un GIF, ajouter le bouton pour télécharger en .gif
            if (isGif) {
                row.addComponents(
                    new disbut.MessageButton()
                        .setLabel('Télécharger en .gif')
                        .setStyle('url')
                        .setURL(avatarURL)
                );
            }

            // Créer l'embed avec l'avatar de l'utilisateur
            const Embed = new Discord.MessageEmbed()
                .setTitle(`${user.username}`)
                .setImage(avatarURL)
                .setColor(color);

            // Si l'avatar est un GIF, afficher l'avatar en tant que GIF
            if (isGif) {
                Embed.setImage(avatarURL);  // Assurer que le GIF est affiché si c'est le cas
            }

            // Envoie l'embed avec les boutons
            message.channel.send({
                embed: Embed,
                component: row // Utilisation de 'component' pour Discord.js v12
            });
        }
    }
};
