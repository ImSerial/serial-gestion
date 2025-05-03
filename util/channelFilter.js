module.exports = (message) => {
    if (!message.guild) return true; // Ignore les DMs

    const unsupportedChannels = ["news", "store", "voice", "category", "forum"];

    if (unsupportedChannels.includes(message.channel.type)) {
        console.log(`[IGNORÉ] Salon non compatible : ${message.channel.name} (${message.channel.type})`);
        return true; // Bloque l'exécution de la commande
    }

    return false; // Autorise l'exécution de la commande
};
