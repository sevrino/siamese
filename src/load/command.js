const path = require('path');
const chalk = require('chalk');
const Discord = require('discord.js');
const { lstatSync, readdirSync } = require('fs');
const ERROR = require('@/constants/error');


const commandRoot = path.join(__dirname, '..', 'commands');

const loadAllCommands = async () => {
	const commands = new Discord.Collection();
	const commandDirs = readdirSync(commandRoot)
		.filter(file => lstatSync(path.join(commandRoot, file)).isDirectory());

	for (const category of commandDirs) {
		await loadCategory(category, commands);
	}

	return commands;
};

const loadCategory = async (category, commands) => {
	try {
		const dirMeta = require(path.join(commandRoot, category, 'index.js'));

		// Load commands in dir
		const commandFiles = readdirSync(path.join(commandRoot, category))
			.filter(file => file !== 'index.js')
			.map(cmd => `@/commands/${category}/${cmd}`);
		for (const cmd of commandFiles) {
			const command = await loadCommand(cmd);
			if (command) {
				command.category = dirMeta;
				commands.set(command.name, command);
			}
		}
	}
	catch (err) {
		console.error(chalk.red(ERROR.CMD.CATEGORY_LOAD_FAILED(category)));
		console.error(err);
	}
};

const loadCommand = async cmd => {
	try {
		return require(cmd);
	}
	catch (err) {
		console.error(chalk.red(ERROR.CMD.LOAD_FAILED(`${cmd}`)));
		console.error(chalk.dim(err));
	}
};

module.exports = {
	loadAllCommands: loadAllCommands,
	loadCategory: loadCategory,
	loadCommand: loadCommand,
};
