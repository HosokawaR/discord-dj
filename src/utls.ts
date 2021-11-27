import { APIInteractionGuildMember } from "discord-api-types"
import { GuildMember } from "discord.js"

export const isGuildMember = (
    x: GuildMember | APIInteractionGuildMember
): x is GuildMember => {
    return "voice" in x
}
