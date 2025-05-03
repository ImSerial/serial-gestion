const Discord = require('discord.js');
const db = require('quick.db');
const math = require('mathjs'); 

const { MessageButton, MessageActionRow } = require('discord-buttons');

module.exports = {
  name: 'calc',
  aliases: [],
  run: async (client, message, args, prefix, color) => {
    let perm = false;

    message.member.roles.cache.forEach(role => {
      if (db.get(`modsp_${message.guild.id}_${role.id}`) || 
          db.get(`ownerp_${message.guild.id}_${role.id}`) || 
          db.get(`admin_${message.guild.id}_${role.id}`)) {
        perm = true;
        return; // Exit loop early if permission found
      }
    });

    if (client.config.owner.includes(message.author.id) || 
        db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || 
        perm || 
        db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true) {

      if (!args.length) {
        return message.channel.send("Vous devez fournir une expression mathématique à évaluer.");
      }

      let calcular = args.join(' ');

      try {
        const result = math.evaluate(calcular);
        const embed = new Discord.MessageEmbed()
          .setTitle("Résultat")
          .setDescription(`\`\`\`${result}\`\`\``)
          .setColor(color);

        message.channel.send(embed);
      } catch (err) {
        message.channel.send(`Erreur de format: ${err.message}`);
      }

    } else {
      return;
    }
  }
};
