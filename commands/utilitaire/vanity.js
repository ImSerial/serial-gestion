const Discord = require('discord.js');

module.exports = {
    name: 'vanity',
    run: async (client, message) => {
        if (!message.guild.premiumTier || message.guild.premiumSubscriptionCount < 14) {
            return message.channel.send("🚀 **Ce serveur n'a pas encore atteint le niveau de boost requis pour une URL personnalisée !**");
        }

        let vanity = message.guild.vanityURLCode; // Récupération de l'URL personnalisée

        if (!vanity) {
            return message.channel.send("**Ce serveur n'a pas défini d'URL personnalisée.**");
        }

        let vanityURL = `https://discord.gg/${vanity}`;
        return message.channel.send(`🔗 **URL personnalisée du serveur :** ${vanityURL}`);
    }
};
