const axios = require('axios');
const db = require("quick.db");
const {
	MessageEmbed
} = require("discord.js");
const ms = require("ms");
const request = require("request");

module.exports = async (client, oldGuild, newGuild) => {
	try {
		const guild = oldGuild;
		const color = db.get(`color_${guild.id}`) === null ? client.config.color : db.get(`color_${guild.id}`);
		
		// Récupération des logs d'audit
		axios.get(`https://discord.com/api/v9/guilds/${guild.id}/audit-logs?ilimit=1&action_type=1`, {
			headers: {
				Authorization: `Bot ${client.config.token}`
			}
		}).then(async response => {
			const raidlog = guild.channels.cache.get(db.get(`${guild.id}.raidlog`));

			if (response.data && response.data.audit_log_entries[0].user_id) {
				const executorId = response.data.audit_log_entries[0].user_id; // ID de l'utilisateur qui a fait la modification

				// Ignore les actions faites par le bot lui-même
				if (executorId === client.user.id) return;  // Si c'est le bot qui modifie, on ne fait rien

				// Vérification si l'utilisateur est dans la whitelist (propriétaire ou autre)
				let perm = false;

				if (db.get(`updatewl_${guild.id}`) === null) {
					perm =
						client.user.id === executorId || // Vérifie si c'est le bot
						guild.ownerId === executorId || // Vérifie si c'est le propriétaire du serveur
						client.config.owner.includes(executorId) || // Vérifie si c'est un propriétaire du bot
						db.get(`ownermd_${client.user.id}_${executorId}`) === true || // Vérifie si l'utilisateur est un modérateur spécifique
						db.get(`wlmd_${guild.id}_${executorId}`) === true; // Vérifie si l'utilisateur est dans la whitelist du serveur
				} else if (db.get(`updatewl_${guild.id}`) === true) {
					perm =
						client.user.id === executorId || 
						guild.ownerId === executorId || 
						client.config.owner.includes(executorId) || 
						db.get(`ownermd_${client.user.id}_${executorId}`) === true;
				}

				// Si l'utilisateur n'est pas dans la whitelist, appliquer les sanctions
				if (db.get(`update_${guild.id}`) === true && !perm) {
					if (db.get(`updatesanction_${guild.id}`) === "ban") {
						axios({
							url: `https://discord.com/api/v9/guilds/${guild.id}/bans/${executorId}`,
							method: 'PUT',
							headers: {
								Authorization: `Bot ${client.config.token}`
							},
							data: {
								delete_message_days: '1',
								reason: 'ServerUpdate'
							}
						}).then(() => {
							update(oldGuild, newGuild);
							if (raidlog) return raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${executorId}> a modifié le serveur, il a été **ban** !`));
						}).catch(() => {
							update(oldGuild, newGuild);
							if (raidlog) return raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${executorId}> a modifié le serveur, mais il n'a pas pu être **ban** !`));
						});
					} else if (db.get(`updatesanction_${guild.id}`) === "kick") {
						guild.members.cache.get(executorId).kick().then(() => {
							update(oldGuild, newGuild);
							if (raidlog) return raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${executorId}> a modifié le serveur, il a été **kick** !`));
						}).catch(() => {
							update(oldGuild, newGuild);
							if (raidlog) return raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${executorId}> a modifié le serveur, mais il n'a pas pu être **kick** !`));
						});
					} else if (db.get(`updatesanction_${guild.id}`) === "derank") {
						guild.members.cache.get(executorId).roles.set([]).then(() => {
							update(oldGuild, newGuild);
							if (raidlog) return raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${executorId}> a modifié le serveur, il a été **derank** !`));
						}).catch(() => {
							update(oldGuild, newGuild);
							if (raidlog) return raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${executorId}> a modifié le serveur, mais il n'a pas pu être **derank** !`));
						});
					}
				}
			}
		});

	} catch (error) {
		console.error(error);
		return;
	}

	async function update(oldGuild, newGuild) {
		// Si le nom du serveur a changé, on le réinitialise
		if (oldGuild.name !== newGuild.name) {
			await newGuild.setName(oldGuild.name);
		}
		// Si l'icône a changé, on la réinitialise
		if (oldGuild.iconURL({ dynamic: true }) !== newGuild.iconURL({ dynamic: true })) {
			await newGuild.setIcon(oldGuild.iconURL({ dynamic: true }));
		}
		// Si la bannière a changé, on la réinitialise
		if (oldGuild.bannerURL() !== newGuild.bannerURL()) {
			await newGuild.setBanner(oldGuild.bannerURL());
		}
		// Vérifier si la position du serveur a changé
		if (oldGuild.position !== newGuild.position) {
			await newGuild.setChannelPositions([{ channel: oldGuild.id, position: oldGuild.position }]);
		}
		// Réinitialiser les autres paramètres si nécessaire
		if (oldGuild.systemChannel !== newGuild.systemChannel) {
			await newGuild.setSystemChannel(oldGuild.systemChannel);
		}
		if (oldGuild.systemChannelFlags !== newGuild.systemChannelFlags) {
			await newGuild.setSystemChannelFlags(oldGuild.systemChannelFlags);
		}
		if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
			await newGuild.setVerificationLevel(oldGuild.verificationLevel);
		}
		if (oldGuild.widget !== newGuild.widget) {
			await newGuild.setWidget(oldGuild.widget);
		}
		if (oldGuild.splashURL !== newGuild.splashURL) {
			await newGuild.setSplash(oldGuild.splashURL);
		}
		if (oldGuild.rulesChannel !== newGuild.rulesChannel) {
			await newGuild.setRulesChannel(oldGuild.rulesChannel);
		}
		if (oldGuild.publicUpdatesChannel !== newGuild.publicUpdatesChannel) {
			await newGuild.setPublicUpdatesChannel(oldGuild.publicUpdatesChannel);
		}
		if (oldGuild.defaultMessageNotifications !== newGuild.defaultMessageNotifications) {
			await newGuild.setDefaultMessageNotifications(oldGuild.defaultMessageNotifications);
		}
		if (oldGuild.afkChannel !== newGuild.afkChannel) {
			await newGuild.setAFKChannel(oldGuild.afkChannel);
		}
		if (oldGuild.region !== newGuild.region) {
			await newGuild.setRegion(oldGuild.region);
		}
		if (oldGuild.afkTimeout !== newGuild.afkTimeout) {
			await newGuild.setAFKTimeout(oldGuild.afkTimeout);
		}

		// Si le code vanity URL a changé, le réinitialiser
		if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
			const settings = {
				url: `https://discord.com/api/v6/guilds/${oldGuild.id}/vanity-url`,
				body: { code: oldGuild.vanityURLCode },
				json: true,
				method: 'PATCH',
				headers: { "Authorization": `Bot ${client.config.token}` }
			};
			await request(settings, (err, res, body) => {
				if (err) {
					console.error("Erreur lors de la mise à jour de la vanity URL :", err);
				}
			});
		}
	}
};
