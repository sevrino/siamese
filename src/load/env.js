const fs = require('fs');
const path = require('path');
const { typetest, validator } = require('@/utils/typetest');


global.env = {};
// env file exists at root folder with name 'bot.env'
fs.readFileSync(path.join(__dirname, '../..', 'bot.env'), 'utf8')
	.split('\n')
	.filter(line => line && !line.startsWith('#'))
	.forEach(line => {
		const [key, val] = line.split('=');
		global.env[key] = val.replace(/^"(.+(?="$))"$/, '$1');
	});

const essentialConfigs = {
	BOT_TOKEN: validator.notEmptyStr,
	BOT_DEFAULT_PREFIX: validator.notEmptyStr,
	BOT_DEV_SERVER_INVITE: validator.notEmptyStr,
	BOT_BUG_REPORT_CHANNEL: validator.notEmptyStr,
	BOT_FEATURE_REQUEST_CHANNEL: validator.notEmptyStr,
};
typetest(global.env, essentialConfigs);

global.env = Object.freeze(global.env);
