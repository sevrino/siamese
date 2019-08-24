const { aquirePlayer } = require('@/music/helper');
const EMOJI = require('@/constants/emoji');
const PERMISSION = require('@/constants/permission');
const { IN } = require('@/constants/commands/music');


module.exports = {
	name: IN.CMD,
	description: IN.DESC,
	permissions: [
		PERMISSION.CONNECT,
	],
	execute: async (context) => {
		context.channel.startTyping();
		await aquirePlayer(context);
		context.msg.react(EMOJI.THUMBS_UP);
		context.channel.stopTyping();
	},
};
