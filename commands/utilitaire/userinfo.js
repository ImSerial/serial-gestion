const Discord = require('discord.js');
const db = require('quick.db');
const {
    MessageActionRow,
    MessageButton,
    MessageMenuOption,
    MessageMenu
} = require('discord-buttons');
const axios = require('axios');

module.exports = {
    name: 'userinfo',
    aliases: ['user', 'ui'],
    run: async (client, message, args, prefix, color) => {
        // Vérification des permissions de l'utilisateur exécutant la commande
        let perm = "";
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
        });

        // Vérifie si l'utilisateur a les permissions nécessaires ou s'il est propriétaire
        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm || db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true) {
            // Récupération de l'utilisateur mentionné ou de l'auteur du message
            let user = message.mentions.members.first();
            if (user) user = user.id;
            if (!user) user = args[0];
            if (!user) user = message.author.id;
            if (!message.guild.members.cache.has(user)) return message.channel.send(`Aucun membre trouvé pour \`${args[0]}\``);
            else user = message.guild.members.cache.get(user);

            // Calcul du nombre de serveurs en commun
            let nm = 0;
            client.guilds.cache.map(r => {
                const list = client.guilds.cache.get(r.id);
                list.members.cache.map(m => (m.user.id == user.id ? nm++ : nm = nm));
            });

            // Requête à l'API Discord pour obtenir la bannière de l'utilisateur
            const data = await axios.get(`https://discord.com/api/users/${user.id}`, {
                headers: {
                    Authorization: `Bot ${client.config.token}`
                }
            }).then(d => d.data);

            if (data.banner) {
                // Construction de l'URL de la bannière
                let url = data.banner.startsWith("a_") ? ".gif?size=2048" : ".png?size=2048";
                url = `https://cdn.discordapp.com/banners/${user.id}/${data.banner}${url}`;

                // Embed avec la bannière
                const UserInfo = new Discord.MessageEmbed()
                    .setTitle(user.user.username) // Titre de l'embed
                    .setDescription(`Présent sur ce serveur depuis le <t:${parseInt(user.joinedTimestamp / 1000)}:d>\nCompte créé le <t:${parseInt(user.user.createdTimestamp / 1000)}:d>\nServeur en commun: **${nm}**`)
                    .setThumbnail(user.user.displayAvatarURL({ dynamic: true })) // Avatar de l'utilisateur
                    .setImage(url) // Bannière de l'utilisateur
                    .setColor(color); // Couleur de l'embed

                message.channel.send(UserInfo);
            } else {
                // Embed sans bannière (image par défaut)
                const UserInfo = new Discord.MessageEmbed()
                    .setTitle(user.user.username) // Titre de l'embed
                    .setDescription(`Présent sur ce serveur depuis le <t:${parseInt(user.joinedTimestamp / 1000)}:d>\nCompte créé le <t:${parseInt(user.user.createdTimestamp / 1000)}:d>\nServeur en commun: **${nm}**`)
                    .setThumbnail(user.user.displayAvatarURL({ dynamic: true })) // Avatar de l'utilisateur
                    .setColor(color) // Couleur de l'embed
                    .setImage("https://cdn.discordapp.com/attachments/914596914161397762/922439441589616660/image.png"); // Image par défaut

                message.channel.send(UserInfo);
            }
        }
    }
};
