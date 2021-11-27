import { SlashCommandBuilder } from "@discordjs/builders"
import { Player } from "discord-player"
import {
    Awaitable,
    CacheType,
    CommandInteraction,
    GuildMember,
} from "discord.js"

type CommandAction = (
    interaction: CommandInteraction<CacheType>,
    player: Player
) => Awaitable<void>

export type Command = {
    overview: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    execute: CommandAction
}
