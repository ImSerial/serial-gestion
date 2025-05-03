const axios = require('axios');
const db = require("quick.db");
const { MessageEmbed } = require("discord.js");
const ms = require("ms");

module.exports = async (client, member, role) => {
  const guild = member.guild;
  const color = db.get(`color_${guild.id}`) === null ? client.config.color : db.get(`color_${guild.id}`);
  const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));  // Canal pour les logs de raid

  // 1. Vérification de la blacklistRank (Ne touche pas, ça fonctionne)
  if (db.get(`blrankmd_${client.user.id}_${member.id}`) !== null) {
    member.roles.remove(role.id).then(() => {
      if (raidlog) {
        raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${action.executor.id}> a ajouté un rôle à ${member}, mais il est blacklisté. Rôle supprimé.`));
      }
    }).catch(() => {
      if (raidlog) {
        raidlog.send(new MessageEmbed().setColor(color).setDescription(`Erreur lors de la suppression du rôle de ${member}, mais il est blacklisté.`));
      }
    });
  }

  // 2. Vérification du changement de rôle
  const action = await guild.fetchAuditLogs({
    limit: 1,
    type: "MEMBER_ROLE_UPDATE"
  }).then(audit => audit.entries.first());

  let perm = "";
  
  // 3. Vérification des permissions (si l'exécuteur est whitelisté)
  if (db.get(`rolesaddwl_${guild.id}`) === null) {
    perm = client.user.id === action.executor.id || guild.owner.id === action.executor.id || client.config.owner.includes(action.executor.id) || db.get(`ownermd_${client.user.id}_${action.executor.id}`) === true || db.get(`wlmd_${guild.id}_${action.executor.id}`) === true;
  }
  if (db.get(`rolesaddwl_${guild.id}`) === true) {
    perm = client.user.id === action.executor.id || guild.owner.id === action.executor.id || client.config.owner.includes(action.executor.id) || db.get(`ownermd_${client.user.id}_${action.executor.id}`) === true;
  }

  // Si l'exécuteur n'a pas les permissions pour ajouter des rôles dangereux
  if (db.get(`rolesadd_${guild.id}`) === true && !perm) {
    // Vérification des permissions dangereuses dans le rôle ajouté
    if (role.permissions.has("KICK_MEMBERS") || role.permissions.has("BAN_MEMBERS") || role.permissions.has("ADMINISTRATOR") || role.permissions.has("MANAGE_CHANNELS") || role.permissions.has("MANAGE_GUILD") || role.permissions.has("MENTION_EVERYONE") || role.permissions.has("MANAGE_ROLES")) {
      
      // 4. Appliquer une sanction en fonction de la configuration de la sanction
      if (db.get(`rolesaddsanction_${guild.id}`) === "ban") {
        // Ban l'exécuteur
        axios({
          url: `https://discord.com/api/v9/guilds/${guild.id}/bans/${action.executor.id}`,
          method: 'PUT',
          headers: {
            Authorization: `Bot ${client.config.token}`
          },
          data: {
            delete_message_days: '1',
            reason: 'AntiDangerous Role'
          }
        }).then(() => {
          member.roles.remove(role.id);  // Supprimer le rôle du membre
          if (raidlog) {
            raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${action.executor.id}> a ajouté un rôle avec des permissions dangereuses à \`${member.user.tag}\`, il a été **ban** !`));
          }
        }).catch(() => {
          member.roles.remove(role.id);  // Toujours supprimer le rôle, même si le ban échoue
          if (raidlog) {
            raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${action.executor.id}> a ajouté un rôle avec des permissions dangereuses à \`${member.user.tag}\`, mais l'exécution du ban a échoué.`));
          }
        });
      } else if (db.get(`rolesaddsanction_${guild.id}`) === "kick") {
        // Kick l'exécuteur
        guild.members.cache.get(action.executor.id).kick().then(() => {
          member.roles.remove(role.id);
          if (raidlog) {
            raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${action.executor.id}> a ajouté un rôle avec des permissions dangereuses à \`${member.user.tag}\`, il a été **kick** !`));
          }
        }).catch(() => {
          member.roles.remove(role.id);
          if (raidlog) {
            raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${action.executor.id}> a ajouté un rôle avec des permissions dangereuses à \`${member.user.tag}\`, mais l'exécution du kick a échoué.`));
          }
        });
      } else if (db.get(`rolesaddsanction_${guild.id}`) === "derank") {
        // Retirer tous les rôles de l'exécuteur
        guild.members.cache.get(action.executor.id).roles.set([]).then(() => {
          member.roles.remove(role.id);
          if (raidlog) {
            raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${action.executor.id}> a ajouté un rôle avec des permissions dangereuses à \`${member.user.tag}\`, il a été **derank** !`));
          }
        }).catch(() => {
          member.roles.remove(role.id);
          if (raidlog) {
            raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${action.executor.id}> a ajouté un rôle avec des permissions dangereuses à \`${member.user.tag}\`, mais l'exécution du derank a échoué.`));
          }
        });
      }
    }
  }
};
