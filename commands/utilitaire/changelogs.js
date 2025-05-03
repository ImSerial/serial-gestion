const db = require("quick.db");
const Discord = require("discord.js");

module.exports = {
    name: "changelogs",
    run: async (client, message) => {
        const color = db.get(`color_${message.guild.id}`) || client.config.color;

        let perm = "";
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (!(client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm || db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true)) {
            return message.channel.send;
        }

        const embed = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle("Changements récents")
            .setDescription("[Voir le projet sur GitHub](https://github.com/serial-checker/Serial-Gestion)\n\n✨ **Dernières améliorations et ajouts sur le bot :**")
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .addField("🆕 **Ajouts récents :**", 
                "• ✨ **`prevname`** : *Affiche l'historique des pseudos d'un utilisateur.*\n" +
                "• 🐌 **`cfx`** : *Permet de voir l'état des serveurs CFX.re*\n" +
                "• 🎧 **`bring [all]`** : *Déplace un ou tout les membres vers un salon vocal précis.*\n" +
                "• 🔧 **`delrole`** : *Retire un rôle à un membre.*\n" +
                "• 👄 **`fakesay`** : *La commande envoie un message en se faisant passer pour un membre*\n" +
                "• 🚀 **`dmall`** : *Permet d'envoyer un message en fonction du rôle choisis à tout les membres le possédant*\n" +
                "• 🎁 **`nitro`** : *Permet d'envoyer un code nitro*\n" +
                "• 📍 **`checkreact [ping]`** : *Permet de voir les réaction d'un rôle bien précis sur un message bien précis et aussi de ping*\n" +           
                "• 🤖 **`mybot`** : *Affiche tous les bots perso que vous possedez*\n\u200B")
            .addField("🔧 **Rework :**", 
                "• 🔞 **`porngif`** : *Ajout de catégorie pornographique*\n" +
                "• 🎨 **`help`** & **`help all`** : *Modification de certaine perm pour certaine commande*\n" +
                "• 🔑 **Permissions :** *Fix de toute les permissions sur toutes les commandes*\n\u200B")
            .addField("📊 **Logs ajoutées :**", 
                "• 🛡️ **`voiceChannelJoin`** : *La logs s'affiche enfin.*\n" +
                "• 🛡️ **`voiceChannelLeave`** : *La logs s'affiche enfin*\n" +
                "• 🛡️ **`voiceStreamingStrart`** : *La logs s'affiche enfin*\n" +
                "• 🎧 **`voiceStreamingStop`** : *La logs s'affiche enfin*")
            .setFooter("🕰️ Dernière mise à jour :")
            .setTimestamp();

        message.channel.send(embed);
    }
};
