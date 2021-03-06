const { MessageEmbed } = require('discord.js');
const COLOR = require('@/constants/color');
const PERMISSION = require('@/constants/permission');
const { INFO } = require('@/constants/commands/bot');


module.exports = {
	name: INFO.CMD,
	description: INFO.DESC,
	hidden: false,
	devOnly: false,
	permissions: [PERMISSION.EMBED_LINKS],
	execute: ({ bot, channel, guild }) => {
		const guildCnt = bot.guilds.size;
		const userCnt = bot.guilds.reduce((total, server) => {
			return total + server.members.size;
		}, 0);
		const playerCnt = bot.players.size;
		const botName = bot.getNameIn(guild);

		const embed = new MessageEmbed()
			.setAuthor(botName, bot.user.avatarURL())
			.setColor(COLOR.BOT)
			.setThumbnail(bot.user.avatarURL());

		const descs = [];
		descs.push(INFO.GUILD_CNT(guildCnt));
		descs.push(INFO.USER_CNT(userCnt));
		descs.push(INFO.PLAYER_CNT(playerCnt));
		embed.setDescription(descs.join('\n'));

		if (global.env.BOT_GITHUB_URL) {
			embed.setFooter(global.env.BOT_GITHUB_URL, INFO.GITHUB_ICON_URL);
		}

		channel.send(embed);
	},
};
