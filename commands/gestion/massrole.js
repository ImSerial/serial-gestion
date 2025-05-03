const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
  name: 'massrole',
  aliases: ['massiverole'],
  run: async (client, message, args, prefix, color) => {
    let perm = false;
    message.member.roles.cache.forEach(role => {
      if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
    });

    if (
      client.config.owner.includes(message.author.id) ||
      db.get(`ownermd_${client.user.id}_${message.author.id}`) === true ||
      perm
    ) {
      if (!['add', 'remove'].includes(args[0])) {
        return message.channel.send(
          `Veuillez spécifier une action valide (\`add\` ou \`remove\`).`
        );
      }

      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
      if (!role) {
        return message.channel.send(`Aucun rôle trouvé pour \`${args[1] || ' '}\``);
      }

      const action = args[0] === 'add' ? 'ajouté' : 'retiré';
      const startEmbed = new Discord.MessageEmbed()
        .setColor(color || '#3498db')
        .setTitle(`Massrole : Opération commencée`)
        .setDescription(
          `Je commence à **${action}** le rôle \`${role.name}\` à tous les membres du serveur.\n\n` +
          `**Action initiée par :** ${message.author.tag}\n` +
          `**Rôle ciblé :** ${role.name} (${role.id})\n` +
          `**Membres du serveur :** ${message.guild.memberCount}`
        )
        .setFooter(
          `${client.config.name}`,
          client.user.displayAvatarURL()
        )
        .setTimestamp();

      message.channel.send(startEmbed);

      const startTime = Date.now();

      try {
        const members = await message.guild.members.fetch();
        let processed = 0;
        let success = 0;
        let failed = 0;

        for (const member of members.values()) {
          processed++;
          try {
            if (args[0] === 'add') {
              if (!member.roles.cache.has(role.id)) {
                await member.roles.add(role, `Massrole par ${message.author.tag}`);
                success++;
              }
            } else if (args[0] === 'remove') {
              if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role, `Massrole par ${message.author.tag}`);
                success++;
              }
            }
          } catch (err) {
            failed++;
          }

          await new Promise(resolve => setTimeout(resolve, 200));
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        const resultEmbed = new Discord.MessageEmbed()
          .setColor(color || '#3498db')
          .setTitle(`Massrole : ${args[0].toUpperCase()} terminé`)
          .setDescription(
            `Le rôle \`${role.name}\` a été **${action}** à plusieurs membres.\n\n` +
            `**Détails de l'opération :**\n` +
            `👥 **Total traité :** ${processed}\n` +
            `✅ **Réussites :** ${success}\n` +
            `❌ **Échecs :** ${failed}\n` +
            `⏱ **Durée :** ${duration} secondes`
          )
          .setFooter(
            `Effectué par ${message.author.tag} • ${client.config.name}`,
            client.user.displayAvatarURL()
          )
          .setTimestamp();

        message.channel.send(resultEmbed).catch(err => console.error("Erreur lors de l'envoi de l'embed :", err));
      } catch (err) {
        console.error(err);
        message.channel.send(
          "Une erreur s'est produite lors de la récupération des membres. Assurez-vous que j'ai les permissions nécessaires."
        );
      }
    } else {
      return; // Ne rien faire si l'utilisateur n'a pas les permissions nécessaires
    }
  },
};
