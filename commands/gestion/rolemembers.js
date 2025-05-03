const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
  name: 'rolemembers',
  aliases: [],
  run: async (client, message, args, prefix, color) => {
    try {
      // Vérification des permissions
      let perm = false;
      message.member.roles.cache.forEach(role => {
        if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
        if (db.get(`modsp_${message.guild.id}_${role.id}`) || db.get(`admin_${message.guild.id}_${role.id}`)) perm = null;
      });

      // Vérification des droits spécifiques
      if (!(client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm)) {
        return;
      }

      // Récupérer le rôle mentionné
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
      if (!role) {
        return message.channel.send(`Aucun rôle trouvé pour \`${args[0] || 'rien'}\``);
      }

      // Récupérer les membres ayant ce rôle
      const membersWithRole = message.guild.members.cache.filter(member => member.roles.cache.has(role.id));
      
      // Si aucun membre n'a ce rôle
      if (membersWithRole.size === 0) {
        return message.channel.send(`Aucun membre trouvé avec le rôle \`${role.name}\``);
      }

      console.log(`${membersWithRole.size} membres trouvés avec le rôle ${role.name}.`);

      // Préparer l'embed
      const embed = new Discord.MessageEmbed()
        .setColor(color || '#3498db') // Utilisation de la couleur fournie, sinon une couleur par défaut
        .setTitle(`Liste des membres ayant le rôle **${role.name}**`)
        //.setThumbnail(message.guild.iconURL()) // Icône du serveur
        .setFooter(`Total: ${membersWithRole.size} • ${client.config.name}`) // Footer avec total et le nom du bot
        //.setTimestamp();

      // Construire la liste des membres au format :
      // *1 -  ${member.user.tag}*
      let memberList = '';
      let counter = 1;
      membersWithRole.forEach(member => {
        memberList += `*${counter} -  ${member.user.tag}*\n`;
        counter++;
      });

      // Si la liste est trop longue, on va diviser l'embed en plusieurs messages
      if (memberList.length > 2048) {
        const chunks = [];
        while (memberList.length > 2048) {
          chunks.push(memberList.substring(0, 2048));
          memberList = memberList.substring(2048);
        }
        chunks.forEach(chunk => {
          embed.setDescription(chunk);
          message.channel.send(embed).catch(err => console.error("Erreur lors de l'envoi d'un chunk : ", err));
        });
      } else {
        embed.setDescription(memberList); // Ajouter la liste des membres dans la description de l'embed
        message.channel.send(embed).catch(err => console.error("Erreur lors de l'envoi de l'embed : ", err));
      }
      
    } catch (error) {
      console.error("Erreur dans la commande rolemembers : ", error);
      message.channel.send("Une erreur est survenue, veuillez réessayer.");
    }
  }
};
