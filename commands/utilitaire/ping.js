const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'ping',
    aliases: ["speed", "api"],

    run: async (client, message, args, prefix, color) => {

        let perm = "";
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (client.config.owner.includes(message.author.id) || 
            db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || 
            perm || 
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true) {
            
            let embedLoading = new MessageEmbed()
                .addField("Ping", `Calcul en cours...`, true)
                .addField("Latence", `${client.ws.ping}ms`, true)
                .setColor(color)
                .setTimestamp()
                .setFooter(client.config.name);

            let msg = await message.channel.send(embedLoading);

            const ping = Date.now() - message.createdTimestamp;

            let embedResult = new MessageEmbed()
                .addField("Discord API :", `${ping}ms`, true)
                .addField(`Latence : ${client.user.username}`, `${client.ws.ping}ms`, true)
                .setColor(color)
                .setTimestamp()
                .setFooter(client.config.name);

            return msg.edit(embedResult);
        }
    }
};
