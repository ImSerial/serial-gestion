const axios = require('axios');
const db = require("quick.db");
const { MessageEmbed } = require("discord.js");
const ms = require("ms");

module.exports = async (client, member) => {
    const guild = member.guild;
    const color = db.get(`color_${guild.id}`) === null ? client.config.color : db.get(`color_${guild.id}`);
    
    // Récupération des données de mute pour le membre
    const isMuted = db.get(`mute_${guild.id}_${member.id}`) === true;
    const muteRole = await db.fetch(`mRole_${guild.id}`);

    // Si le membre est enregistré comme muet et qu'un rôle muet est défini, on applique le rôle
    if (isMuted && muteRole) {
        member.roles.add(muteRole, `Automod - Réintégration en tant que muet`);
    }
};
