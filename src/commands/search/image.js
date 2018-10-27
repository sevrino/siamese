const axios = require('axios');
const { Parser } = require('htmlparser2');
const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');


module.exports = lang => {
	const { IMAGE, SEARCH, AXIOS_HEADER } = require('@/constants')(lang);

	return {
		name: IMAGE.CMD,
		description: IMAGE.DESC,
		usage: IMAGE.USAGE,
		hidden: false,
		devOnly: false,
		execute: async ({ bot, msg, channel, content }) => {
			if (!content) {
				msg.reply(SEARCH.ERROR_EMPTY_CONTENT);
				return;
			}
			await channel.startTyping();

			const searchText = encodeURIComponent(content);
			await axios.get(IMAGE.SEARCH_URL(searchText), {
				headers: AXIOS_HEADER,
			}).then(body => {
				const images = findAllImages(body.data);
				if (!images.length) {
					msg.reply(SEARCH.ERROR_EMPTY_RESULT(IMAGE.TARGET));
					return;
				}

				const recital = new Recital(bot, msg);
				const pages = images.map(imageUrl => {
					return new EmbedPage()
						.setImage(imageUrl);
				});
				recital.book.addPages(pages);
				recital.start(IMAGE.RECITAL_TIME);
			});

			await channel.stopTyping();
		},
	};
};

const findAllImages = data => {
	let metaFlag = false;
	const foundImages = [];
	const parser = new Parser({
		ontext: text => {
			if (metaFlag) {
				const imageMeta = JSON.parse(text);
				foundImages.push(imageMeta.ou);
			}
		},
		onopentag: (name, attrs) => {
			if (name !== 'div') return;
			if (!attrs.class) return;
			if (attrs.class.split(' ').some(className => className === 'rg_meta')) {
				metaFlag = true;
			}
		},
		onclosetag: () => {
			metaFlag = false;
		},
	});

	parser.write(data);
	parser.end();

	return foundImages;
};