const { MessageEmbed } = require('discord.js');
const db = require('quick.db');
const superagent = require('superagent');

module.exports = {
    name: 'porngif',
    aliases: ["pgif"],
    run: async (client, message, args, prefix, color) => {
        let perm = false;

        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (
            client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) === true ||
            perm ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true
        ) {
            // Vérifier si le salon est NSFW
            if (!message.channel.nsfw) {
                return;
            }

            console.log("Commande exécutée par :", message.author.tag);

            const categories = ["pgif", "ass", "anal", "pussy", "boobs", "hentai", "4k"];
            let category = args[0] ? args[0].toLowerCase() : "pgif";

            if (!categories.includes(category)) {
                return;
            }

            console.log("Catégorie demandée :", category);

            const embed = new MessageEmbed()
                //.setTitle(category)
                .setColor(color);

            try {
                const { body } = await superagent.get('https://nekobot.xyz/api/image').query({ type: category });
                embed.setImage(body.message);
                message.channel.send({ embed });
            } catch (error) {
                console.error("Erreur lors de la récupération de l'image :", error);
                return;
            }
        }
    }
};
