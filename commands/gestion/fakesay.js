const Discord = require('discord.js');
const db = require('quick.db');
const {
    MessageActionRow,
    MessageButton,
    MessageMenuOption,
    MessageMenu
} = require('discord-buttons');

module.exports = {
    name: 'fakesay',
    aliases: [],

    run: async (client, message, args, prefix, color) => {
        message.delete();

        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {
            let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!user) return message.channel.send("❌ Merci de mentionner un membre ou de fournir un ID valide.");
            
            let tosay = args.slice(1).join(" ");
            if (!tosay) return;
            if (tosay.includes("discord.gg/") || tosay.includes("https://discord.gg/")) return;
            if ((tosay.includes("@everyone") || tosay.includes("@here")) && !message.member.hasPermission("MENTION_EVERYONE")) return;
            
            message.channel.fetchWebhooks().then(async webhooks => {
                let webhook = webhooks.find(wh => wh.name === "FakeSay");
                if (!webhook) webhook = await message.channel.createWebhook("FakeSay", { avatar: user.user.displayAvatarURL({ dynamic: true }) });
                
                await webhook.edit({ name: user.user.username, avatar: user.user.displayAvatarURL({ dynamic: true }) });
                
                await webhook.send(tosay, {
                    username: user.user.username,
                    avatarURL: user.user.displayAvatarURL({ dynamic: true })
                });
                
                setTimeout(() => {
                    webhook.delete().catch(() => {});
                }, 3000); // Supprime le webhook après 3 secondes
            });
        }
    }
};
