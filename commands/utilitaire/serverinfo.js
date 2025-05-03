const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'serverinfo',
    aliases: ['si'],
    run: async (client, message, args, prefix, color) => {
        try {
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

                const guild = client.guilds.cache.get(args[0]) || message.guild;
                const owner = guild.ownerID ? guild.members.cache.get(guild.ownerID) : null;

                // Construction de l'embed
                const ServerInfo = new Discord.MessageEmbed()
                    .setTitle(`Informations sur le serveur: ${guild.name}`)
                    .setColor(color || '#3498db') // Utilise une couleur par défaut si "color" est nul
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                    .setImage(guild.bannerURL({ size: 1024 }) || null)
                    .addField('📂 Identifiant Serveur', `\`${guild.id}\``, true)
                    .addField('👑 Propriétaire', owner ? `<@${owner.id}>` : 'Non disponible', true)
                    .addField('🛡️ Niveau de vérification', `\`${guild.verificationLevel}\``, true)
                    .addField('🧑‍🤝‍🧑 Nombre de membres', `\`${guild.memberCount}\``, true)
                    .addField('🟢 Membres actifs', `\`${guild.members.cache.filter(m => ['online', 'dnd', 'idle'].includes(m.presence?.status)).size}\``, true)
                    .addField('🤖 Nombre de bots', `\`${guild.members.cache.filter(m => m.user.bot).size}\``, true)
                    .addField('🎤 Utilisateurs en vocal', `\`${guild.members.cache.filter(m => m.voice.channel).size}\``, true)
                    .addField('💎 Nombre de boosts', `\`${guild.premiumSubscriptionCount}\``, true)
                    .addField('🔱 Niveau de boost', `\`${guild.premiumTier || 'Aucun'}\``, true)
                    .addField('📝 Nombre de rôles', `\`${guild.roles.cache.size}\``, true)
                    .addField('📢 Nombre de salons', `\`${guild.channels.cache.size}\``, true)
                    .addField('😀 Émojis', `\`${guild.emojis.cache.size}\``, true)
                    .setFooter(`Serveur créé le ${guild.createdAt.toLocaleDateString()}`)
                    .setTimestamp();

                // Envoi de l'embed dans Discord.js v12
                await message.channel.send(ServerInfo);
            }
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la commande serverinfo:', error);
            message.channel.send('Une erreur s\'est produite lors de l\'exécution de la commande.');
        }
    }
};
