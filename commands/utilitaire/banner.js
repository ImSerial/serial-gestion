const Discord = require('discord.js');
const db = require('quick.db');
const axios = require("axios");
const disbut = require('discord-buttons'); // Importer discord-buttons

module.exports = {
    name: 'banner',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let perm = "";
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm || db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true) {
            
            // Vérifier si un utilisateur est mentionné, ou si un ID d'utilisateur est fourni
            let user;
            if (message.mentions.users.size > 0) {
                user = message.mentions.users.first();
            } else if (args[0]) {
                // Tenter de récupérer un utilisateur avec l'ID
                try {
                    user = await client.users.fetch(args[0]);
                } catch (error) {
                    return message.channel.send('Utilisateur introuvable.');
                }
            } else {
                // Si aucune mention ni ID n'est fourni, on utilise l'auteur du message
                user = message.author;
            }

            // Récupérer l'URL de la bannière de l'utilisateur
            const bannerUrl = await getUserBannerUrl(user.id, client, {
                size: 4096
            });

            if (bannerUrl) {
                console.log("URL de la bannière:", bannerUrl); // Log pour vérifier l'URL de la bannière

                // Vérification de la présence du .gif dans l'URL
                const isGif = bannerUrl.endsWith(".gif");

                // Créer les boutons de téléchargement
                const row = new disbut.MessageActionRow()
                    .addComponents(
                        new disbut.MessageButton()
                            .setLabel('Télécharger en .png')
                            .setStyle('url')
                            .setURL(bannerUrl.replace(/\.gif$/, '.png')),

                        new disbut.MessageButton()
                            .setLabel('Télécharger en .webp')
                            .setStyle('url')
                            .setURL(bannerUrl.replace(/\.gif$/, '.webp'))
                    );

                // Si la bannière est un GIF, ajouter un bouton pour télécharger en .gif
                if (isGif) {
                    row.addComponents(
                        new disbut.MessageButton()
                            .setLabel('Télécharger en .gif')
                            .setStyle('url')
                            .setURL(bannerUrl) // URL du GIF
                    );
                    
                    // Créer un embed avec le GIF
                    const Embed = new Discord.MessageEmbed()
                        .setTitle(`${user.username}`)
                        .setImage(bannerUrl) // Affichage de la bannière GIF
                        .setColor(color);

                    // Envoyer le message avec l'embed et les boutons
                    message.channel.send({
                        embed: Embed,
                        component: row // Utilisation de 'component' pour Discord.js v12
                    });
                } else {
                    // Si ce n'est pas un GIF, afficher l'image statique
                    const Embed = new Discord.MessageEmbed()
                        .setTitle(`${user.username}`)
                        .setImage(bannerUrl) // Affichage de la bannière statique
                        .setColor(color);

                    // Envoyer l'embed sans bouton pour .gif
                    message.channel.send({
                        embed: Embed,
                        component: row // Utilisation de 'component' pour Discord.js v12
                    });
                }
            } else {
                const Embed = new Discord.MessageEmbed()
                    .setTitle(`${user.username}`)
                    .setDescription(`<@${user.id}> Ne possède pas de bannière`)
                    .setColor(color);

                message.channel.send(Embed);
            }
        }
    }
};

async function getUserBannerUrl(userId, client, {
    dynamicFormat = true,
    defaultFormat = "webp",
    size = 512
} = {}) {

    if (![16, 32, 64, 128, 256, 512, 1024, 2048, 4096].includes(size)) {
        throw new Error(`The size '${size}' is not supported!`);
    }

    if (!["webp", "png", "jpg", "jpeg"].includes(defaultFormat)) {
        throw new Error(`The format '${defaultFormat}' is not supported as a default format!`);
    }

    // Utiliser client.api pour récupérer l'utilisateur via son ID
    const user = await client.api.users(userId).get();
    if (!user.banner) return null;

    const query = `?size=${size}`;
    const baseUrl = `https://cdn.discordapp.com/banners/${userId}/${user.banner}`;

    console.log(`Base URL: ${baseUrl}`);  // Log pour vérifier l'URL de la bannière

    // Si c'est un fichier GIF, retourner l'URL du GIF
    if (baseUrl.endsWith(".gif")) {
        console.log("GIF détecté, retour de l'URL avec extension .gif");
        return baseUrl + query; // Retourner l'URL avec .gif
    }

    // Si ce n'est pas un GIF, retourner la bannière avec le format par défaut
    console.log("Pas de GIF détecté, retour du format par défaut.");
    return baseUrl + `.${defaultFormat}` + query;
}
