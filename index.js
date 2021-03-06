'use strict';

// For require module alias, this should be required
// check package.json/_moduleAliases
require('module-alias/register');

// Load env file first before any of file, to load constants correctly
require('@/load/env');

// Load all prototype redefinitions
require('@/load/prototype');

// Load fonts
require('@/load/font');

// Create a new bot instance, setup and start it
const Bot = require('@/bot');
const option = require('@/bot.option');
const bot = new Bot(option);

bot.setup()
	.then(() => bot.start())
	.catch(console.error);

const startRestServer = require('./rest/start');
startRestServer(bot);
