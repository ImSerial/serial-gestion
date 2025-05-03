const Discord = require('discord.js');
const db = require('quick.db');

// Vérification si la couleur est valide
function isValidHexColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
}

module.exports = {
    name: 'theme',
    aliases: ["color"],
    run: async (client, message, args) => {

        // Vérification que l'utilisateur est un propriétaire autorisé
        if (!client.config.owner.includes(message.author.id)) {
            return;
        }

        // Vérification qu'un argument est donné et qu'il n'y en a qu'un
        let newColor = args[0];
        if (!newColor) {
            return message.channel.send("Tu dois spécifier une couleur pour l'embed.");
        }
        if (args[1]) {
            return message.channel.send("Tu ne peux spécifier qu'une seule couleur.");
        }

        // Validation de la couleur (format hexadécimal)
        if (!isValidHexColor(newColor)) {
            return message.channel.send("La couleur spécifiée n'est pas valide. Utilise un code hexadécimal valide (ex: #FF5733).");
        }

        // Enregistrement de la couleur dans la base de données
        db.set(`color_${message.guild.id}`, newColor);

        // Création de l'embed pour confirmer le changement de couleur
        const embed = new Discord.MessageEmbed()
            .setColor(newColor)  // Utilisation de la couleur spécifiée par l'utilisateur
            .setTitle("Couleur modifiée")
            .setDescription(`La couleur de l'embed est maintenant : \`${newColor}\``)
            .setTimestamp()
            .setFooter("Changement effectué par " + message.author.tag);

        // Envoi de l'embed dans le canal
        message.channel.send(embed);
    }
};
