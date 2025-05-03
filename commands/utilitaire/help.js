const Discord = require('discord.js')
const db = require('quick.db')
const {
	MessageActionRow,
	MessageButton,
	MessageMenuOption,
	MessageMenu
} = require('discord-buttons');
const {
	ButtonPages
} = require('../../util/embedButton/start.js');

module.exports = {
	name: 'help',
	aliases: ['aide','tuto'],
	run: async (client, message, args, prefix, color) => {
		if (args[0] === "all") {

			const public = new Discord.MessageEmbed()
				.setColor(color)
				.setFooter(`Prefix : ${prefix}`)
				.setTitle("Liste des commandes par permissions")
				
				.setDescription(`

**__Public__**
- \`${client.config.prefix}banner [membre]\`
- \`${client.config.prefix}vanity\`
- \`${client.config.prefix}changelogs\`
- \`${client.config.prefix}invite [membre]\`
- \`${client.config.prefix}support\`
- \`${client.config.prefix}pic [membre]\`
- \`${client.config.prefix}porngif\` (*Salon nsfw*)
- \`${client.config.prefix}snipe\`
- \`${client.config.prefix}ping\`
- \`${client.config.prefix}serverinfo [guild]\`
- \`${client.config.prefix}userinfo [user]\`
- \`${client.config.prefix}top [rank]\`
- \`${client.config.prefix}help\`
- \`${client.config.prefix}channelinfo [sallon]\`
- \`${client.config.prefix}prevname [membre]\`
- \`${client.config.prefix}rank [membre]\`
`)

			let perm = ""
			message.member.roles.cache.forEach(role => {
				if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true
				if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true
				if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true
			})
			if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {

				const mods = new Discord.MessageEmbed()
					.setColor(color)
					.setFooter(`Prefix : ${prefix}`)
					.setTitle("Liste des commandes par permissions")
					
					.setDescription(`*Les commandes **Public** sont aussi disponible pour la permissions **Mods***
                
**__Perm Mods__**
- \`${client.config.prefix}warn <add/list/remove/clear> <add/remove: membre> <remove: warnID>\`
- \`${client.config.prefix}help all\`
- \`${client.config.prefix}mute <membre> [temps/raison]\`
- \`${client.config.prefix}mutelist\`
- \`${client.config.prefix}unmute <membre>\`
- \`${client.config.prefix}prevname [membre]\`
`)

				const admin = new Discord.MessageEmbed()
					.setColor(color)
					.setFooter(`Prefix : ${prefix}`)
					.setTitle("Liste des commandes par permissions")
					
					.setDescription(`*Les commandes disponible pour les permissions **Mods** sont aussi disponible pour la permissions **Admin***
                
**__Perm Admin__**
- \`${client.config.prefix}voice [info all/all]\`
- \`${client.config.prefix}ban <membre> [raison]\`
- \`${client.config.prefix}unban <membre>\`
- \`${client.config.prefix}banlist\`
- \`${client.config.prefix}allbot\`
- \`${client.config.prefix}alladmin\`
`)

				const owner = new Discord.MessageEmbed()
					.setColor(color)
					.setFooter(`Prefix : ${prefix}`)
					.setTitle("Liste des commandes par permissions")
					
					.setDescription(`*Les commandes disponible pour les permissions **Admin** sont aussi disponible pour la permissions **Owner***
                
** __Perm Owner__**
- \`${client.config.prefix}unlock [salon]\`
- \`${client.config.prefix}renew [salon]\`
- \`${client.config.prefix}lock [salon]\`
- \`${client.config.prefix}clear [membre] [message]\`

`)

				const owner2 = new Discord.MessageEmbed()
					.setColor(color)
					.setFooter(`Prefix : ${prefix}`)
					.setTitle("Liste des commandes par permissions")
					
					.setDescription(`*Les commandes disponible pour **toute les permissions** sont aussi disponible pour les personnes étant **owner du bot***
                
**__Owner Bot__**
- \`${client.config.prefix}addrole <membre> <rôle>\`
- \`${client.config.prefix}delrole <membre> <rôle>\`
- \`${client.config.prefix}derank <membre>\`
- \`${client.config.prefix}lock all\`
- \`${client.config.prefix}muterole [rôle]\`
- \`${client.config.prefix}renew all\`
- \`${client.config.prefix}unban all\`
- \`${client.config.prefix}unlock all\`
- \`${client.config.prefix}unmute all\`
- \`${client.config.prefix}bring [all]\`
- \`${client.config.prefix}say <message>\`
- \`${client.config.prefix}fakesay <membre> <message>\`
- \`${client.config.prefix}cfx\`
- \`${client.config.prefix}counter\`
- \`${client.config.prefix}embed\`
- \`${client.config.prefix}emoji <add/remove> <emoji>\`
- \`${client.config.prefix}levels\`
- \`${client.config.prefix}logs\`
- \`${client.config.prefix}massrole <add/remove> <rôle>\`
- \`${client.config.prefix}perm\`
- \`${client.config.prefix}public <add/clear/list/remove> <add/remove: salon>\`
- \`${client.config.prefix}rolemenu\`
- \`${client.config.prefix}soutien\`
- \`${client.config.prefix}tempvoc\`
- \`${client.config.prefix}welcome\`
- \`${client.config.prefix}theme <color>\`
- \`${client.config.prefix}blacklist <add/clear/list/remove> <add/remove: membre>\`
- \`${client.config.prefix}blacklistrank <add/clear/list/remove> <add/remove: membre>\`
- \`${client.config.prefix}whitelist <add/clear/list/remove> <add/remove: membre>\`
`)
					.setFooter(`Prefix : ${prefix}`)

				const embedPages = [public, mods, admin, owner, owner2];
				ButtonPages(client.interaction, message, embedPages, 60 * 1000, "gray", "▶", "◀");
			}


		} else if (!args[0]) {



			let perm = ""
			message.member.roles.cache.forEach(role => {
				if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = 1
				if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = 2
				if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = 3
			})
			if (db.get(`ownermd_${client.user.id}_${message.author.id}`) === true) perm = 4
			if (client.config.owner.includes(message.author.id)) perm = 5

			const util = new Discord.MessageEmbed()
			util.setColor(color)
			util.setFooter(`Prefix : ${prefix}`)
			util.setTitle("Utilitaire")
			
			util.setDescription("*Les paramètres entre **`<...>`** sont obligatoire, alors que les paramètres entre **`[...]`** eux sont facultatifs*")
			util.addField(`\`${prefix}rank [membre]\``, "Permet de voir le rank d'un membre")
			util.addField(`\`${prefix}banner [membre]\``, "Permet de voir la bannière d'un membre")
			util.addField(`\`${prefix}channelinfo [salon/catégorie]\``, "Permet de d'avoir des informations sur un salon textuel ou vocal ou une catégorie")
			util.addField(`\`${prefix}nitro\``, "Permet de générer un code nitro")
			util.addField(`\`${prefix}ping\``, "Permet de voir la latence du bot et de discord")
			util.addField(`\`${prefix}roleinfo [rôle]\``, "Permet de voir les informations d'un rôle")
			util.addField(`\`${prefix}serverinfo [guild]\``, "Permet de voir les informations compléte d'un serveur")
			util.addField(`\`${prefix}userinfo [membre]\``, "Permet de voir les informations détaillé d'un bot")
			util.addField(`\`${prefix}vanity\``, "Permet de voir le lien d'invitations personalisé du serveur")
			util.addField(`\`${prefix}changelogs\``, "Permet de voir les dernières modification du code")
			util.addField(`\`${prefix}snipe\``, "Permet de voir le dernier message supprimer")
			util.addField(`\`${prefix}calc <calcul>\``, "Permet d'éffectuer des calculs mathématique")
			util.addField(`\`${prefix}porngif [catégorie]\``, "Permet de générer des images pornographique uniquement dans des salons **NSFW**")
			util.addField(`\`${prefix}booster\``, "Permet de voir qui a boosté le server ou ce trouve le bot")
			util.addField(`\`${prefix}pic [membre]\``, "Permet de voir la photo de profil d'un utilisateur")
			util.addField(`\`${prefix}top <rank/invite>\``, "Permet de voir le classement des invitations et des ranks")
			//util.addField(`\`${prefix}booster\``, "Permet de voir qui a boosté le serveur ou ce trouve le bot")
			util.addField(`\`${prefix}support\``, "Permet de voir le lien d'invitation du serveur support")
			//util.addField(`\`${prefix}booster\``, "Permet de voir qui a boosté le server ou ce trouve le bot")
			util.addField(`\`${prefix}invite [membre]\``, "Permet de voir combien d'invitation posséde un utilisateur")
			if (1 <= perm) util.addField(`\`${prefix}help all\``, "Permet de voir les commandes du bot via les permissions")
			util.addField(`\`${prefix}prevname [membre]\``, "Permet de voir la liste des anciens nickname d'un utilisateur")
			if (2 <= perm) util.addField(`\`${prefix}voice [info all/all]\``, "Permet de voir les statistics vocal ou général du serveur")
			


			const mods = new Discord.MessageEmbed()
			mods.setColor(color)
			mods.setFooter(`Prefix : ${prefix}`)
			mods.setTitle("Modération")
			
			mods.setDescription("*Les paramètres entre **`<...>`** sont obligatoire, alors que les paramètres entre **`[...]`** eux sont facultatifs*")
			if (1 <= perm) mods.addField(`\`${prefix}warn <add/list/remove/clear> <add/remove: membre> <remove: warnID>\``, "Permet de gérer les sanctions d'un membre")
			if (1 <= perm) mods.addField(`\`${prefix}mute <membre> [temps/raison]\``, "Permet de rendre muet un membre sur le serveur")
			if (1 <= perm) mods.addField(`\`${prefix}mutelist\``, "Permet de voir la liste des membres muet en direct")
			if (1 <= perm) mods.addField(`\`${prefix}unmute <membre>\``, "Permet de demute un membre du serveur")
			if (2 <= perm) mods.addField(`\`${prefix}ban <membre> [raison]\``, "Permet bannir définitivement un membre")
			if (2 <= perm) mods.addField(`\`${prefix}unban <membre>\``, "Permet de débannir un membre bannis")
			if (2 <= perm) mods.addField(`\`${prefix}banlist\``, "Permet de voir la liste des membres bannis")
	        if (3 <= perm) mods.addField(`\`${prefix}unlock [salon]\``, "Permet d'ouvir le chat dans un salon du serveur pour le rôle @everyone")
			if (3 <= perm) mods.addField(`\`${prefix}renew [salon]\``, "Permet de recrée un salon du serveur")
			if (3 <= perm) mods.addField(`\`${prefix}lock [salon]\``, "Permet de fermé le chat dans un salon du serveur pour le rôle @everyone")
			if (3 <= perm) mods.addField(`\`${prefix}clear [membre] [message]\``, "Permet de supprimés des messages dans un salon")
			if (4 <= perm) mods.addField(`\`${prefix}addrole <membre> <rôle>\` *(Seulement les rôles sans permissions dangereuse)*`, "Permet d'àjouter un rôle à un membre sur le serveur")
			if (4 <= perm) mods.addField(`\`${prefix}delrole <membre> <rôle>\` *(Seulement les rôles sans permissions dangereuse)*`, "Permet de retirer un rôle à un membre sur le serveur")
			if (4 <= perm) mods.addField(`\`${prefix}derank <membre>\``, "Permet d'enlever tout les rôles d'un membre")
			if (4 <= perm) mods.addField(`\`${prefix}lock all\``, "Permet de fermé tout les salons du serveur pour le rôle @everyone")
			if (4 <= perm) mods.addField(`\`${prefix}muterole [rôle]\``, "Permet de définir un rôle muet ou d'en crée un")
			if (4 <= perm) mods.addField(`\`${prefix}renew all\``, "Permet de recrée tout les salons du serveur")
			if (4 <= perm) mods.addField(`\`${prefix}unban all\``, "Permet de debannir tout les membres du serveur")
			if (4 <= perm) mods.addField(`\`${prefix}unlock all\``, "Permet de réouvir tout les salons du serveur pour le rôle @everyone")
			if (4 <= perm) mods.addField(`\`${prefix}unmute all\``, "Permet de demute tout les membres muet sur le serveur")
			if (4 <= perm) mods.addField(`\`${prefix}bring [all]\``, "Permet de déplacer un ou tous les utilisateurs d'un vocal à un autre")
			if (4 <= perm) mods.addField(`\`${prefix}say <message>\``, "Permet d'envoyer un message avec le bot")
			if (4 <= perm) mods.addField(`\`${prefix}fakesay <membre> <message>\``, "La commande envoie un message en se faisant passer pour un utilisateur")


			const gestion = new Discord.MessageEmbed()
			gestion.setColor(color)
			gestion.setFooter(`Prefix : ${prefix}`)
			gestion.setTitle("Serveur Gestion")
			
			gestion.setDescription("*Les paramètres entre **`<...>`** sont obligatoire, alors que les paramètres entre **`[...]`** eux sont facultatifs*")
			if (2 <= perm) mods.addField(`\`${prefix}allbot\``, "Permet de voir la liste des bots présent sur le serveur")
			if (2 <= perm) mods.addField(`\`${prefix}alladmin\``, "Permet de voir la liste des membres possédant la permission **Administrateur**")
			if (5 <= perm) gestion.addField(`\`${prefix}antiraid\``, "Permet configurer l'antiraid du code")
			if (4 <= perm) gestion.addField(`\`${prefix}cfx\``, "Permet de voir l'état des serveurs CFX.re")
			if (4 <= perm) gestion.addField(`\`${prefix}counter\``, "Permet de gérer les compteurs personnalisés sur le serveur")
			if (4 <= perm) gestion.addField(`\`${prefix}embed\``, "Permet de crée un embed totalement personalisable")	
			if (4 <= perm) gestion.addField(`\`${prefix}emoji <add/remove> <emoji>\``, "Permet d'ajouté ou d'enlevé un emoji du serveur")
		    if (4 <= perm) gestion.addField(`\`${prefix}leave\``, "Permet de paramétrer les actions à effectuer quand un membre quitte le serveur")
			if (4 <= perm) gestion.addField(`\`${prefix}levels\``, "Permet de paramétrer les actions à effectuer quand un membre gagne un niveau sur le serveur")
			if (4 <= perm) gestion.addField(`\`${prefix}logs\``, "Permet de définir les salons des logs")
			if (4 <= perm) gestion.addField(`\`${prefix}massrole <add/remove> <rôle>\``, "Permet d'ajouté ou d'enlevé un rôle à tout les membres du serveur")
			if (4 <= perm) gestion.addField(`\`${prefix}perm\``, "Affiche la liste des rôles ayant des permissions sur le bot")
			if (4 <= perm) gestion.addField(`\`${prefix}public <add/clear/list/remove> <add/remove: salon>\``, "Permet de gérer les salons où les commandes public sont autorisés")
			if (4 <= perm) gestion.addField(`\`${prefix}rolemenu\``, "Affiche un menu interactif pour créer ou modifier un reactionrole/boutonrole ")
			if (4 <= perm) gestion.addField(`\`${prefix}soutien\``, "Permet de donner automatiquement un rôle aux membres ayant un message dans leurs statuts ")
			if (4 <= perm) gestion.addField(`\`${prefix}tempvoc\``, "Affiche un menu interactif pour gérer les vocaux temporaires sur le serveur")
			if (4 <= perm) gestion.addField(`\`${prefix}welcome\``, "Permet de paramétrer les actions à effectuer quand un membre rejoint le serveur")
			if (4 <= perm) gestion.addField(`\`${prefix}theme <color>\``, "Permet de changer la couleur d'embed du bot")
			if (5 <= perm) gestion.addField(`\`${prefix}antiraid\``, "Permet de gérer les modules d'antiraid sur le serveur")
			if (5 <= perm) gestion.addField(`\`${prefix}raidlog <on/off/> [salon]\``, "Permet de définir le salon de raidlog")
			if (5 <= perm) gestion.addField(`\`${prefix}prefix <prefix>\``, "Permet de changer le prefix du bot")
			if (5 <= perm) gestion.addField(`\`${prefix}cfx\``, "Permet de voir l'état des serveurs CFX.re")
		    if (5 <= perm) gestion.addField(`\`${prefix}dmall <rôle> <message>\``, "Permet d'envoyer un message en fonction du rôle choisis à tout les membres le possédant")

			const bot = new Discord.MessageEmbed()
			bot.setColor(color)
			bot.setFooter(`Prefix : ${prefix}`)
			bot.setTitle("Bot")
			
			bot.setDescription("*Les paramètres entre **`<...>`** sont obligatoire, alors que les paramètres entre **`[...]`** eux sont facultatifs*")
			if (4 <= perm) bot.addField(`\`${prefix}blacklist <add/clear/list/remove> <add/remove: membre>\``, "Permet de gérer les utilisateurs blacklist")
			if (4 <= perm) bot.addField(`\`${prefix}blacklistrank <add/clear/list/remove> <add/remove: membre>\``, "Permet de gérer les utilisateurs blacklistrank")
			if (4 <= perm) bot.addField(`\`${prefix}whitelist <add/clear/list/remove> <add/remove: membre>\``, "Permet de gérer les utilisateurs whitelist")
			if (5 <= perm) bot.addField(`\`${prefix}owner <add/clear/list/remove> <add/remove: membre>\``, "Permet de gérer les utilisateurs owners")
			if (5 <= perm) bot.addField(`\`${prefix}server <invite/leave/list> <leave/invite: ID>\``, "Permet de gérer les serveurs où ce trouve le bot")
			if (5 <= perm) bot.addField(`\`${prefix}botconfig\``, "Permet configurer le bot")
			if (5 <= perm) bot.addField(`\`${prefix}botinfo\``, "Permet de voir les informations détailler du bot")
			if (5 <= perm) bot.addField(`\`${prefix}mybot\``, "Permet de voir tout les bots du client")
			if (5 <= perm) bot.addField(`\`${prefix}backup <emoji> <clear/create/list/load/remove> <2/3/4: code>\``, "Permet de gérer les backups d'émojis sur le bot")
			if (5 <= perm) bot.addField(`\`${prefix}eval\``, "Permet de corriger du code")


			if (perm === "" && db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true) return message.channel.send(util)
			if (perm === 1) {
				const embedPages = [util, mods];
				return ButtonPages(client.interaction, message, embedPages, 60 * 1000, "gray", "▶", "◀");
			} else if (perm === 2 || perm === 3) {
				const embedPages = [util, mods];
				return ButtonPages(client.interaction, message, embedPages, 60 * 1000, "gray", "▶", "◀");
			} else if (perm === 4) {
				const embedPages = [util, mods, gestion, bot];
				return ButtonPages(client.interaction, message, embedPages, 60 * 1000, "gray", "▶", "◀");
			} else if (perm === 5) {
				const embedPages = [util, mods, gestion, bot];
				return ButtonPages(client.interaction, message, embedPages, 60 * 1000, "gray", "▶", "◀");
			}
		}
	}
}
