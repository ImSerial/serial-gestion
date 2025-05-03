const Discord = require("discord.js");
const axios = require("axios");

module.exports = {
    name: "cfx",
    aliases: ["cfxstatus", "fivemstatus"],
    run: async (client, message, args, prefix, color) => {
        if (!client.config.owner.includes(message.author.id)) return; // Permission requise

        async function fetchStatus() {
            try {
                const res = await axios.get("https://status.cfx.re/api/v2/status.json");
                const componentsRes = await axios.get("https://status.cfx.re/api/v2/components.json");

                const globalStatus = res.data.status.description;
                const components = componentsRes.data.components;

                const statusEmoji = (status) => status === "operational" ? "🟢" : "🔴";

                // Générer la date actuelle
                const now = new Date();
                const dateTimeString = now.toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

                const embed = new Discord.MessageEmbed()
                    .setTitle("CFX Server Status")
                    .setColor(color)
                    .setImage('https://www.zonammorpg.com/wp-content/uploads/2023/08/82d62076a21ee0f408aa344403324efb5eb669cd.png')
                    .setThumbnail("https://avatars.githubusercontent.com/u/67628359?s=200&v=4")
                    .addField("**API Status**", `${statusEmoji(globalStatus)} ${globalStatus}`, false)
                    .addField("**Component Status**", components.map(c => `${statusEmoji(c.status)} **${c.name}**`).join("\n"))
                    .setFooter(`📅 Dernière mise à jour : ${dateTimeString}`, "https://avatars.githubusercontent.com/u/67628359?s=200&v=4");

                // Vérifier si un serveur est en panne
                const downComponents = components.filter(c => c.status !== "operational");
                if (downComponents.length > 0) {
                    const alertMessage = downComponents.map(c => `🚨 **${c.name}** est en panne !`).join("\n");
                    embed.addField("🚨 **Problèmes détectés**", alertMessage, false);
                }

                return embed;
            } catch (error) {
                console.error("Erreur lors de la récupération des statuts :", error);
                return new Discord.MessageEmbed()
                    .setTitle("🚨 Erreur de récupération des statuts")
                    .setDescription(`❌ Impossible de récupérer les statuts de CFX.re.\n\n\`Erreur : ${error.message}\``)
                    .setColor(color)
                    .setFooter(`📅 Dernière tentative : ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}`);
            }
        }

        const sentMessage = await message.channel.send(await fetchStatus());

        setInterval(async () => {
            const updatedEmbed = await fetchStatus();
            sentMessage.edit(updatedEmbed);

            // Envoyer une alerte si un serveur tombe en panne
            const downComponents = updatedEmbed.fields.find(f => f.name === "🚨 **Problèmes détectés**");
            if (downComponents) {
                message.channel.send(`⚠️ **Attention !** Certains services CFX rencontrent des problèmes.`);
            }
        }, 60000); // Met à jour toutes les 60 secondes
    }
};
