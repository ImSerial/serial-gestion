const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'mybot',
    aliases: [],
    run: async (client, message, args, prefix, color) => {

        // Contrôle de permission basé sur l'ID utilisateur
        if (message.author.id !== "1133246357960921158") {
            return;
        }

        // Lien d'invitation du bot avec la permission ADMINISTRATEUR uniquement
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`;

        // Création de l'embed avec la couleur de la DB
        const embed = new Discord.MessageEmbed()
            .setTitle("Vos bots")
            .setDescription(`[${client.user.username}](${inviteLink})`)
            .setColor(color) 

        // Envoi de l'embed
        message.channel.send(embed);
    }
};
