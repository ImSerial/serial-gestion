const Discord = require("discord.js");
const ms = require("ms");
const db = require("quick.db");

const cooldown = {};

module.exports = {
    name: 'mute',
    aliases: [],
    run: async (client, message, args, prefix, color) => {
        let perm = false;
        message.member.roles.cache.forEach(role => {
            if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {
            async function createMuteRole() {
                try {
                    const role = await message.guild.roles.create({
                        data: {
                            name: 'muet',
                            permissions: []
                        },
                        reason: "Création d'un rôle muet automatique."
                    });

                    // Configurer les permissions pour le rôle muet
                    message.guild.channels.cache.forEach(channel => {
                        channel.updateOverwrite(role, {
                            SEND_MESSAGES: false,
                            CONNECT: false,
                            ADD_REACTIONS: false,
                            SPEAK: false
                        }, "Configuration du rôle muet");
                    });

                    db.set(`mRole_${message.guild.id}`, role.id);
                    return role;
                } catch (error) {
                    console.error("Erreur lors de la création du rôle muet :", error);
                    message.channel.send("Erreur : Impossible de créer le rôle muet. Vérifiez mes permissions.");
                    return null;
                }
            }

            async function muteMember(user, muterole) {
                try {
                    await user.roles.add(muterole.id);
                    db.set(`mute_${message.guild.id}_${user.id}`, true);
                    return true;
                } catch (error) {
                    console.error(`Erreur lors de l'ajout du rôle muet à ${user.user.tag} :`, error);
                    message.channel.send(`Erreur : Impossible de mute ${user}. Vérifiez mes permissions.`);
                    return false;
                }
            }

            if (args[0]) {
                let chx = db.get(`logmod_${message.guild.id}`);
                const logsmod = message.guild.channels.cache.get(chx);

                let Muted = db.fetch(`mRole_${message.guild.id}`);
                let muterole = message.guild.roles.cache.get(Muted) ||
                    message.guild.roles.cache.find(role => role.name.toLowerCase().includes('mute'));

                var user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
                if (!user) return message.channel.send(`Aucun membre trouvé pour: \`${args[0]}\``);

                if (user.id === message.author.id) {
                    return message.channel.send("Vous ne pouvez pas vous mute vous-même !");
                }

                if (user.id === client.user.id) {
                    return message.channel.send("Je ne peux pas être mute !");
                }

                if (db.get(`mute_${message.guild.id}_${user.id}`)) {
                    return message.channel.send(`<@${user.id}> est déjà mute.`);
                }

                if (!cooldown[message.author.id]) cooldown[message.author.id] = { limit: 0 };
                var authorcooldown = cooldown[message.author.id];
                if (authorcooldown.limit >= 5) {
                    return message.channel.send(`Vous avez atteint votre limite de mute, veuillez retenter plus tard.`);
                }

                if (!muterole) {
                    message.channel.send("Création d'un rôle muet...");
                    muterole = await createMuteRole();
                    if (!muterole) return; // Stop si le rôle n'est pas créé
                }

                let time = args[1] ? ms(args[1].replace("j", "d")) : null;
                let reason = args.slice(time ? 2 : 1).join(" ") || "Aucune raison fournie.";

                if (time) {
                    if (await muteMember(user, muterole)) {
                        message.channel.send(`${user} à été **mute** pendant **${args[1]}** pour \`${reason}\`.`);
                        user.send(`Vous avez été **mute** pendant **${args[1]}** sur ${message.guild.name} pour \`${reason}\`.`);
                        setTimeout(() => {
                            user.roles.remove(muterole.id);
                            db.set(`mute_${message.guild.id}_${user.id}`, null);
                        }, time);
                        if (logsmod) logsmod.send(
                            new Discord.MessageEmbed()
                                .setColor(color)
                                .setDescription(`${message.author} à **mute** ${user} pendant **${args[1]}** pour \`${reason}\``)
                        );
                    }
                } else {
                    if (await muteMember(user, muterole)) {
                        message.channel.send(`${user} à été **mute** pour \`${reason}\`.`);
                        user.send(`Vous avez été **mute** sur ${message.guild.name} pour \`${reason}\`.`);
                        if (logsmod) logsmod.send(
                            new Discord.MessageEmbed()
                                .setColor(color)
                                .setDescription(`${message.author} à **mute** ${user} pour \`${reason}\``)
                        );
                    }
                }
            }
        } else {
            return;
        }
    }
};
