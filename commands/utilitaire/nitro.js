const db = require('quick.db');

module.exports = {
    name: 'nitro',
    aliases: ["nitrogen", "freenitro"],

    run: async (client, message, args, prefix, color) => {

        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (client.config.owner.includes(message.author.id) || 
            db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || 
            perm || 
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true) {
            
            // Génération du code Nitro aléatoire
            function generateNitroCode() {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                let code = "";
                for (let i = 0; i < 16; i++) {
                    code += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return `https://discord.gift/${code}`;
            }

            let nitroCode = generateNitroCode();

            message.channel.send(nitroCode);
        }
    }
};
