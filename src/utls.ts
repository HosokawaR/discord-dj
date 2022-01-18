import { APIInteractionGuildMember } from "discord-api-types"
import { CacheType, CommandInteraction, Guild, GuildMember } from "discord.js"
import { botName, YOUTUBE_API_KEY } from "./config"
import { CommandAction, CommandActionInteraction } from "./types"
import axios from "axios"

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

export const getYouTubeUrl = (movieId: string) =>
    `https://www.youtube.com/watch?v=${movieId}`

export const getOembedUrl = (url: string) =>
    ` https://www.youtube.com/oembed?url=${url}&format=json`

export const fetchMusicOvewview = async (url: string) => {
    const res = await axios.get(getOembedUrl(url))
    return {
        title: res.data.title,
        thumbnailUrl: res.data.thumbnail_url,
        author: res.data.author_name,
    }
}

export const searchYouTube = async (
    query: string
): Promise<string | undefined> => {
    const url = encodeURI(
        `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&type=video&q=${query}`
    )
    const response = await axios.get(url)
    const result = response.data.items
    if (result.length === 0) return
    return response.data.items[0].id.videoId as string
}
