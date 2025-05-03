const db = require('quick.db');

module.exports = {
  name: 'lock',
  aliases: [],
  run: async (client, message, args) => {
    try {
      // Vérification des permissions
      let perm = false;
      message.member.roles.cache.forEach(role => {
        if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
        if (db.get(`modsp_${message.guild.id}_${role.id}`) || db.get(`admin_${message.guild.id}_${role.id}`)) perm = null;
      });

      // Si l'utilisateur n'a pas les permissions nécessaires
      if (!(client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm)) {
        return;
      }

      // Commande pour tout verrouiller (args[0] === "all")
      if (args[0] === 'all') {
        // Promesse pour tous les salons
        const updatePromises = message.guild.channels.cache.map(channel => {
          return channel.updateOverwrite(message.guild.roles.everyone, {
            SEND_MESSAGES: false,
            SPEAK: false,
            ADD_REACTIONS: false
          }).catch(e => {
            console.error(`Erreur lors du verrouillage du salon ${channel.id}: ${e}`);
          });
        });

        // Attendre que toutes les promesses soient résolues
        await Promise.all(updatePromises);
        message.channel.send(`${message.guild.channels.cache.size} salons ont été verrouillés.`);
      } else {
        // Commande pour verrouiller un salon spécifique
        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;

        try {
          // Mise à jour des permissions sur le salon spécifié
          await channel.updateOverwrite(message.guild.roles.everyone, {
            SEND_MESSAGES: false,
            SPEAK: false,
            ADD_REACTIONS: false
          });
          message.channel.send(`Les membres ne peuvent plus parler dans <#${channel.id}>`);
        } catch (e) {
          console.error(`Erreur lors du verrouillage du salon ${channel.id}: ${e}`);
          message.channel.send("Une erreur est survenue en verrouillant le salon.");
        }
      }
    } catch (error) {
      console.error("Erreur générale dans la commande lock : ", error);
      message.channel.send("Une erreur est survenue, veuillez réessayer.");
    }
  }
};
