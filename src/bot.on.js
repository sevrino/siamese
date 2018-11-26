const { RichEmbed } = require('discord.js');
const logMessage = require('@/helper/logMessage');
const COLOR = require('@/constants/color');
const EMOJI = require('@/constants/emoji');
const ERROR = require('@/constants/error');
const { BOT } = require('@/constants/message');
const { HELP } = require('@/constants/commands/utility');
const { LOG_TYPE, ACTIVITY } = require('@/constants/type');


// Functions handling client.on() method


const onReady = async function() {
	this._setLogger();
	await this._setupDatabase();

	this.logger.log(LOG_TYPE.VERBOSE)
		.atConsole()
		.setTitle(BOT.READY_INDICATOR(this))
		.setColor(COLOR.BOT)
		.send();

	this.logger.log(LOG_TYPE.VERBOSE)
		.setTitle(BOT.READY_TITLE(this))
		.setDescription(BOT.READY_DESC(this))
		.setThumbnail(this.user.avatarURL)
		.setColor(COLOR.GOOD)
		.send();

	// Set default activity
	const activity = `${global.env.BOT_DEFAULT_PREFIX}${HELP.CMD}`;
	this.user.setActivity(activity, {
		type: ACTIVITY.LISTENING,
	});
};

const onMessage = async function(msg) {
	const prefix = this.prefix;

	logMessage(msg);

	if (!msg.content.startsWith(prefix) || msg.author.bot) return;

	const args = msg.content.slice(prefix.length).split(/ +/);
	const cmdName = args.shift();

	// No command matched
	if (!this.commands.has(cmdName)) return;

	let cmd = this.commands.get(cmdName);
	// Exclude one blank after command name
	let content = msg.content.slice(prefix.length + cmdName.length + 1);

	if (cmd.subcommands && cmd.subcommands.has(args[0])) {
		const subcommandName = args[0];
		// Remove first arg by calling shift
		cmd = cmd.subcommands.get(args.shift());
		content = content.slice(subcommandName.length + 1);
	}

	// Dev-only check
	if (cmd.devOnly && msg.author.id !== global.env.BOT_DEV_USER_ID) return;

	// Permissions check
	const permissionsGranted = msg.channel.permissionsFor(this.user);
	if (cmd.permissions && !cmd.permissions.every(permission => permissionsGranted.has(permission.flag))) {
		const neededPermissionList = cmd.permissions.reduce((prevStr, permission) => {
			return `${prevStr}\n- ${permission.message}`;
		}, '');
		msg.channel.send(ERROR.CMD.PERMISSION_IS_MISSING(neededPermissionList));
		return;
	}

	// Cooldown check
	if (cmd.cooldown) {
		const key = msg[cmd.cooldown.key].id;
		const type = cmd.cooldown.type;
		const cooldown = this.cooldowns[type];
		const prevExecuteTime = cooldown.get(key);
		if (prevExecuteTime) {
			// it's on cooldown, send inform msg
			const timeDiff = new Date() - prevExecuteTime.start;
			const diffInSeconds = (prevExecuteTime.duration - (timeDiff / 1000)).toFixed(1);
			msg.error(ERROR.CMD.ON_COOLDOWN(diffInSeconds));
			return;
		}
		else {
			// it's not on cooldown
			cooldown.set(key, {
				start: new Date(),
				duration: cmd.cooldown.time,
			});
			setTimeout(() => {
				cooldown.delete(key);
			}, cmd.cooldown.time * 1000);
		}
	}

	try {
		if (!cmd.execute) {
			// Case of subcommand-container
			// Only execute if it has execute() method
			return;
		}
		await cmd.execute({
			bot: this,
			msg: msg,
			content: content,
			author: msg.member,
			guild: msg.guild,
			channel: msg.channel,
			args: args,
		});
	}
	catch (err) {
		await msg.channel.stopTyping();

		msg.channel.send(ERROR.CMD.FAILED);
		this.logger.error(err, msg);
	}
};

const onGuildJoin = function(guild) {
	if (!(guild.systemChannel)) return;
	const helpCmd = `${this.prefix}${HELP.CMD}`;
	const embedMsg = new RichEmbed().setTitle(BOT.GUILD_JOIN_TITLE)
		.setDescription(BOT.GUILD_JOIN_DESC(this, helpCmd))
		.setThumbnail(this.user.avatarURL)
		.setFooter(BOT.GUILD_JOIN_FOOTER(this))
		.setColor(COLOR.BOT);
	guild.systemChannel.send(embedMsg);
};

const onError = function(err) {
	// Known error
	if (err.message === 'read ECONNRESET') return;
	this.logger.log(LOG_TYPE.ERROR)
		.setTitle(ERROR.CMD.FAIL_TITLE(err))
		.setDescription(ERROR.CMD.FAIL_DESC(err))
		.send();
};

const onWarning = function(info) {
	this.logger.log(LOG_TYPE.VERBOSE)
		.setTitle(`${EMOJI.WARNING} WARNING`)
		.setDescription(info.toString())
		.setColor(COLOR.WARNING)
		.send();
};

module.exports = {
	ready: onReady,
	message: onMessage,
	guildCreate: onGuildJoin,
	error: onError,
	warn: onWarning,
};
