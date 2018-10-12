const chalk = require('chalk');
const { COLOR, ERROR, LOG } = require('@/constants');
const { RichEmbed } = require('discord.js');

module.exports = class Logger {
	constructor(bot, channelIds = {
		verbose: null,
		error: null,
	}) {
		const verboseChannel = bot.channels.has(channelIds.verbose) ?
			bot.channels.get(channelIds.verbose) : null;
		const errorChannel = bot.channels.has(channelIds.error) ?
			bot.channels.get(channelIds.error) : null;
		this._channels = {
			VERBOSE: verboseChannel,
			ERROR: errorChannel,
		};
	}

	log(mode) {
		return (this._channels[mode]) ?
			new EmbedLog(mode, this._channels[mode]) :
			new StringLog(mode);
	}
};

class Log {
	constructor(mode) {
		if (new.target === Log) {
			throw new TypeError(ERROR.ABSTRACT_CLASS_INSTANTIZED(Log));
		}
		if (!(mode in LOG)) {
			throw new Error(ERROR.LOG_MODE_NOT_DEFINED(mode));
		}
		this._mode = mode;
	}

	/* eslint-disable */
	atConsole() {}
	setTitle(title) {}
	setDescription(desc) {}
	setThumbnail(thumb) {}
	setColor(color) {}
	send() {}
	/* eslint-enable */
}

class EmbedLog extends Log {
	constructor(mode, channel) {
		super(mode);
		this._embed = new RichEmbed();
		this._channel = channel;
	}
	atConsole() {
		const log = new StringLog(this._mode);

		if (this._embed.title) log.setTitle(this._embed.title);
		if (this._embed.description) log.setDescription(this._embed.description);
		if (this._embed.color) {
			log.setColor(`#${this._embed.color.toString(16)}`);
		}

		return log;
	}
	setTitle(title) {
		this._embed.setTitle(title);
		return this;
	}
	setDescription(desc) {
		this._embed.setDescription(desc);
		return this;
	}
	setThumbnail(thumb) {
		this._embed.setThumbnail(thumb);
		return this;
	}
	setColor(color) {
		this._embed.setColor(color);
		return this;
	}
	send() {
		if (!this._embed.color) this._embed.setColor(COLOR[this._mode]);
		this._embed.setTimestamp(new Date());
		this._channel.send(this._embed);
	}
}

class StringLog extends Log {
	constructor(mode) {
		super(mode);
		this._msg = {
			title: null,
			desc: null,
			color: '#ffffff',
		};
	}
	atConsole() {
		// DO NOTHING
		return this;
	}
	setTitle(title) {
		this._msg.title = title;
		return this;
	}
	setDescription(desc) {
		this._msg.desc = desc;
		return this;
	}
	// eslint-disable-next-line
	setThumbnail(thumb) {
		// DO NOTHING
		return this;
	}
	setColor(color) {
		this._msg.color = color;
		return this;
	}
	send() {
		const timeStamp = new Date().toLocaleString();
		console.log(chalk.white.dim(`[${timeStamp}]`));
		if (this._msg.title) {
			console.log(chalk.hex(this._msg.color).bold(this._msg.title));
		}
		if (this._msg.desc) {
			console.log(chalk.white(this._msg.desc));
		}
	}
}
