const db = require("quick.db");

module.exports = {
    name: "slowmode",
    aliases: ["sm"],
    run: async (client, message, args, prefix, color) => {
        let perm = false;
        message.member.roles.cache.forEach((role) => {
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (
            !client.config.owner.includes(message.author.id) &&
            !db.get(`ownermd_${client.user.id}_${message.author.id}`) &&
            !perm
        ) {
            return;
        }

        const channelArg = args[0];
        const slowmodeTime = args[1];

        if (!channelArg || !slowmodeTime || isNaN(slowmodeTime)) {
            return message.channel.send(
                "Veuillez fournir un salon valide (mention ou ID) et un temps (en secondes) pour le mode ralenti.\nExemple : `+slowmode #général 10` ou `+slowmode 123456789012345678 10`"
            );
        }

        const targetChannel =
            message.mentions.channels.first() ||
            message.guild.channels.cache.get(channelArg);

        if (!targetChannel) {
            return message.channel.send(
                "Le salon spécifié est introuvable. Assurez-vous qu'il s'agit d'une mention ou d'un ID valide."
            );
        }

        if (slowmodeTime < 0 || slowmodeTime > 21600) {
            return message.channel.send(
                "Le temps de slowmode doit être compris entre 0 et 21600 secondes (6 heures)."
            );
        }

        targetChannel
            .setRateLimitPerUser(parseInt(slowmodeTime), `Défini par ${message.author.tag}`)
            .then(() => {
                message.channel.send(
                    `✅ Mode ralenti défini sur **${slowmodeTime} secondes** pour le salon ${targetChannel}.`
                );
            })
            .catch((error) => {
                console.error(error);
                message.channel.send(
                    "❌ Une erreur est survenue lors de la configuration du mode ralenti pour ce salon."
                );
            });
    },
};
