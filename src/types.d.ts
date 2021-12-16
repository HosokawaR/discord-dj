import { SlashCommandBuilder } from "@discordjs/builders"
import {
    Awaitable,
    CacheType,
    CommandInteraction,
    Guild,
    GuildMember,
} from "discord.js"

export type CommandActionInteraction = CommandInteraction<CacheType> & {
    guild: Guild
    member: GuildMember
}

type CommandAction = (interaction: CommandActionInteraction) => Awaitable<void>

export type Command = {
    overview: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    execute: CommandAction
}
