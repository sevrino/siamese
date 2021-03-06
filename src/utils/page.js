const dedent = require('@/utils/dedent');
const { MessageEmbed } = require('discord.js');


class EmbedPage {
	constructor() {
		this._embed = new MessageEmbed();
	}
	setTitle(title) {
		// Check null & undefined
		if (title) {
			this._embed.setTitle(title);
		}
		return this;
	}
	setDescription(desc) {
		if (desc) {
			this._embed.setDescription(desc);
		}
		return this;
	}
	setFooter(footer, icon) {
		if (footer) {
			this._embed.setFooter(footer, icon);
		}
		return this;
	}
	setURL(url) {
		this._embed.setURL(url);
		return this;
	}
	setImage(imageUrl) {
		this._embed.setImage(imageUrl);
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
	setData(data) {
		this._data = data;
		return this;
	}
	addField(title, description, inline) {
		this._embed.addField(title, description, inline);
		return this;
	}
	setAuthor(name, icon, url) {
		this._embed.setAuthor(name, icon, url);
		return this;
	}
	get isEmbed() { return true; }
	get content() { return this._embed; }
	get data() { return this._data; }
}

class StringPage {
	constructor() {
		this._msg = {
			title: null,
			desc: null,
			footer: null,
			color: null,
		};
	}
	setTitle(title) {
		if (title) {
			this._msg.title = title;
		}
		return this;
	}
	setDescription(desc) {
		if (desc) {
			this._msg.desc = desc;
		}
		return this;
	}
	setFooter(footer) {
		if (footer) {
			this._msg.footer = footer;
		}
		return this;
	}
	setImage() {
		// DO NOTHING
		return this;
	}
	setThumbnail() {
		// DO NOTHING
		return this;
	}
	setURL() {
		// DO NOTHING
		return this;
	}
	setColor(color) {
		this._msg.color = color;
		return this;
	}
	setData(data) {
		this._data = data;
		return this;
	}
	get isEmbed() { return false; }
	get content() {
		return dedent`
			${this._msg.title ? this._msg.title : ''}
			${this._msg.desc ? this._msg.desc : ''}
			${this._msg.footer ? this._msg.footer : ''}
		`;
	}
	get data() { return this._data; }
}


module.exports = {
	EmbedPage: EmbedPage,
	StringPage: StringPage,
};
