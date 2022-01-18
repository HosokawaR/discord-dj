import { Client } from "discord.js"
import {
    AIRTABLE_BASE,
    AIRTABLE_KEY,
    commandChannelId,
    guildId,
    voiceChannelId,
} from "./config"
import { generateEmbed } from "./generateEmbed"
import { playMusic } from "./playMusic"
import { fetchMusicOvewview, getYouTubeUrl, searchYouTube } from "./utls"
import * as Airtable from "airtable"

export const addTrack = async (
    client: Client,
    query: string,
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

    const successed = await playMusic(guild, voiceChannel, query)
    if (!successed) {
        commandChannel.send(`${query} の検索結果がありませんでした。`)
        return
    }

    const musicId = await searchYouTube(query)
    if (!musicId) return
    const musicOverview = await fetchMusicOvewview(getYouTubeUrl(musicId))

    Airtable.configure({
        apiKey: AIRTABLE_KEY,
    })
    const base = Airtable.base(AIRTABLE_BASE)
    base("logs").create({
        id: musicId,
        name: musicOverview.title,
        create_by: user.displayName,
    })

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
