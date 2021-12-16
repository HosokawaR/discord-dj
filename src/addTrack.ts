import { Client } from "discord.js"
import { commandChannelId, guildId, voiceChannelId } from "./config"
import { generateEmbed } from "./generateEmbed"
import { playMusic } from "./playMusic"
import { fetchMusicOvewview, getYouTubeUrl } from "./utls"

export const addTrack = async (
    client: Client,
    musicId: string,
    userName: string
) => {
    const voiceChannel = client.channels.cache.get(voiceChannelId)
    if (!voiceChannel?.isVoice()) return

    const guild = client.guilds.cache.get(guildId)
    if (!guild) return

    const userCollection = await guild?.members.fetch({ query: userName })
    const user = Array.from(userCollection.values())[0]
    if (!user) return

    const commandChannel = client.channels.cache.get(commandChannelId)
    if (!commandChannel?.isText()) return

    await playMusic(guild, voiceChannel, musicId)

    const musicOverview = await fetchMusicOvewview(getYouTubeUrl(musicId))
    commandChannel.send({
        embeds: [
            generateEmbed(
                musicOverview.title,
                musicId,
                user,
                musicOverview.thumbnailUrl,
                musicOverview.author
            ),
        ],
    })
}
