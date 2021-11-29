import { APIInteractionGuildMember } from "discord-api-types"
import { CacheType, CommandInteraction, Guild, GuildMember } from "discord.js"
import { botName } from "./config"
import { CommandAction, CommandActionInteraction } from "./types"

export const isGuildMember = (
    x: GuildMember | APIInteractionGuildMember
): x is GuildMember => {
    return "voice" in x
}

export const hasGuild = (
    x: CommandInteraction<CacheType>
): x is CommandInteraction<CacheType> & { guild: Guild } => x.guild !== null

export const hasOnlyGuildMember = (
    x: CommandInteraction<CacheType>
): x is CommandInteraction<CacheType> & { member: GuildMember } =>
    isGuildMember(x.member)

export const commandTypeGard = (
    x: CommandInteraction<CacheType>
): x is CommandActionInteraction => hasGuild(x) && hasOnlyGuildMember(x)

export const canCommandBot = async (
    interaction: CommandInteraction<CacheType> & { member: GuildMember }
) => {
    if (!interaction.member.voice.channelId) {
        await interaction.reply({
            content:
                "ボイスチャンネルに入室した状態でコマンドを入力してください。",
            ephemeral: true,
        })
        return
    }
    if (
        interaction?.guild?.me?.voice.channelId &&
        interaction.member.voice.channelId !==
            interaction.guild.me.voice.channelId
    ) {
        interaction.reply({
            content: `${botName} と同じボイスチャンネルに入室した状態でコマンドを入力してください。`,
            ephemeral: true,
        })
        return
    }
}
