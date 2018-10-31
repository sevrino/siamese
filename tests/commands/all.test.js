const Tataru = require('@/tataru');
const { makeBotMock } = require('../setups/mock');


describe('Commands', () => {
	it('has correct meta datas', async () => {
		const tataru = makeBotMock();
		await tataru._loadCommands();

		const commands = tataru.commands.get(global.env.BOT_DEFAULT_LANG);
		commands.tap(command => {
			expect(typeof(command.name)).toBe('string');
			expect(typeof(command.description)).toBe('string');
			expect(command.usage === null || typeof(command.usage) === 'string').toBeTruthy();
			expect(typeof(command.hidden)).toBe('boolean');
			expect(typeof(command.devOnly)).toBe('boolean');
			expect(typeof(command.execute)).toBe('function');
		});
	});
});
