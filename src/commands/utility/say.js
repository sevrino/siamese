const ERROR = require('@/constants/error');
const { SAY } = require('@/constants/commands/utility');


module.exports = {
	name: SAY.CMD,
	description: SAY.DESC,
	usage: SAY.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: ({ msg, channel, content }) => {
		// Can't react for empty content
		if (!content) {
			msg.error(ERROR.CMD.EMPTY_CONTENT(SAY.TARGET));
			return;
		}
		msg.delete();
		channel.send(content);
	},
};
