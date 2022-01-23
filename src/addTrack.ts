import {
    Client,
    Collection,
    MessageReaction,
    ReactionCollector,
    User,
} from "discord.js"
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
import { addMusicLog, addRating } from "./airtable"

const ratingEmojis = new Map<string, { emoji: string; rating: number }>()

ratingEmojis.set("one", {
    emoji: "1️⃣",
    rating: 1,
})
ratingEmojis.set("two", {
    emoji: "2️⃣",
    rating: 2,
})
ratingEmojis.set("three", {
    emoji: "3️⃣",
    rating: 3,
})

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

    const embed = await commandChannel.send({
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

    const message = await commandChannel.send({
        content: "この曲の評価は？",
    })

    await message.react(ratingEmojis.get("one")?.emoji || "")
    await message.react(ratingEmojis.get("two")?.emoji || "")
    await message.react(ratingEmojis.get("three")?.emoji || "")

    const filter = (reaction: MessageReaction, user: User) =>
        Array.from(ratingEmojis.values())
            .map((value) => value.emoji)
            .includes(reaction.emoji.name || "") && !user.bot

    const collector = await message.createReactionCollector({
        filter,
        time: 10 * 1000,
    })

    const reactions = new Map<User, number>()

    const recordId = await addMusicLog(
        musicId,
        musicOverview.title,
        user.displayName
    )

    collector.on("collect", (reaction, user) => {
        const rating = Array.from(ratingEmojis.entries()).find(
            (entry) => entry[1].emoji === reaction.emoji.name
        )?.[1].rating
        if (!rating) return
        reactions.set(user, rating)
    })

    collector.on("remove", (_, user) => {
        reactions.delete(user)
    })

    collector.on("end", async () => {
        console.log(reactions)

        if (!reactions.size) return

        try {
            await addRating(reactions, recordId)
        } catch (error) {
            console.error(error)
        }

        message.edit({ content: "投票終了！" })
    })
}
