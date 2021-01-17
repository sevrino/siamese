import { MessageEmbed } from "discord.js";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import { strong, block } from "~/utils/markdown";

import { HELP } from "~/const/commands/bot";
import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";

import CommandContext from "~/types/CommandContext";

export default new Command({
  name: HELP.CMD,
  description: HELP.DESC,
  cooldown: Cooldown.PER_CHANNEL(5),
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.MANAGE_MESSAGES
  ],
  execute: async (ctx: CommandContext) => {
    const { bot } = ctx;
    const prefix = bot.prefix;

    const categories = bot.categories
      .map(category => {
        const embed = new MessageEmbed()
          .setDescription(`${category.categoryEmoji} ${strong(category.name)}\n${category.description}`)
          .setColor(COLOR.BOT);
        const commands = category.commands;
        commands
          .filter(command => command.devOnly || command)
          .forEach(cmd => {
            if (cmd.execute) {
              // Works whether space exist in prefix or not
              const commandTitle = strong(`${category.commandEmoji} ${cmd.name}`);
              const commandUsage = [EMOJI.ARROW_SHADED_RIGHT, `${prefix}${cmd.name}`, cmd.usage].filter(str => str).join(" ");
              embed.addField(commandTitle, `${commandUsage}\n${block(cmd.description)}`);
            }
            if (cmd.subcommands) {
              cmd.subcommands.forEach(subcmd => {
                const commandTitle = strong(`${category.commandEmoji} ${cmd.name} ${subcmd.name}`);
                const commandUsage = [EMOJI.ARROW_SHADED_RIGHT, `${prefix}${cmd.name} ${subcmd.name}`, subcmd.usage].filter(str => str).join(" ");
                embed.addField(commandTitle, `${commandUsage}\n${block(subcmd.description)}`);
              });
            }
          });
        return embed;
      });

    const menu = new Menu(ctx, { maxWaitTime: HELP.RECITAL_TIME });
    menu.add(...categories);

    await menu.start();
  }
});