import {
    Client,
    GuildMember,
    Intents,
    MessageEmbed,
    TextChannel,
    User,
} from "discord.js"
import {
    clientId,
    commandChannelId,
    guildId,
    HOST_NAME,
    PORT,
    token,
    voiceChannelId,
} from "./config"
import { deployCommand, commands } from "./deploy-commands"
import { Player, QueryType } from "discord-player"
import { canCommandBot, commandTypeGard, isGuildMember } from "./utls"
import * as http from "http"
import axios from "axios"

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
})

const player = new Player(client)

client.on("ready", async () => {
    console.log(`Logged in as ${client.user?.tag || "名無し"}!`)
})

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        const command = commands.find(
            (command) => command.overview.name === interaction.commandName
        )

        if (!command) {
            await interaction.reply({
                content: `${interaction.commandName}というコマンドは見つかりません。`,
            })
            return
        }

        try {
            if (!commandTypeGard(interaction)) {
                await interaction.reply({ content: "エラーが発生しました。" })
                return
            }
            if (!canCommandBot(interaction)) return
            await command.execute(interaction, player)
        } catch (error) {
            console.error(error)
            await interaction.reply({ content: "エラーが発生しました。" })
        }
    }
})
;(async () => await deployCommand)()

const getYouTubeUrl = (movieId: string) =>
    `https://www.youtube.com/watch?v=${movieId}`

const getOembedUrl = (url: string) =>
    ` https://www.youtube.com/oembed?url=${url}&format=json`

export const fetchMusicOvewview = async (url: string) => {
    const res = await axios.get(getOembedUrl(url))
    return {
        title: res.data.title,
        thumbnailUrl: res.data.thumbnail_url,
        author: res.data.author_name,
    }
}

const generateEmbed = (
    title: string,
    movieId: string,
    user: GuildMember,
    imageUrl: string,
    movieAuthor: string
) =>
    new MessageEmbed()
        .setColor("#00bfff")
        .setTitle(title)
        .setURL(getYouTubeUrl(movieId))
        .setAuthor(`${user.displayName} が追加しました`, user.avatarURL() || "")
        .setDescription(movieAuthor)
        .setThumbnail(imageUrl)
        .setFooter(
            "この曲は Music Library for YouTube によって追加されました。"
        )

const addTrack = async (query: string, userName: string) => {
    const voiceChannel = client.channels.cache.get(voiceChannelId)
    if (!voiceChannel?.isVoice()) return
    const guild = client.guilds.cache.get(guildId)
    if (!guild) return
    const userCollection = await guild?.members.fetch({ query: userName })
    const user = Array.from(userCollection.values())[0]
    if (!user) return
    console.log(`選択された人: ${user}`)
    const commandChannel = client.channels.cache.get(commandChannelId)
    if (!commandChannel?.isText()) return

    const queue = player.createQueue(guild, {
        metadata: {
            channel: commandChannel,
        },
        ytdlOptions: {
            filter: "audioonly",
        },
        leaveOnEmpty: false,
        leaveOnEnd: false,
        leaveOnStop: false,
    })

    try {
        queue.connect(voiceChannel)
    } catch {
        queue.destroy()
        console.log("接続エラー")
        return
    }

    const track = await player
        .search(query, {
            requestedBy: user,
            searchEngine: QueryType.YOUTUBE_SEARCH,
        })
        .then((x) => x.tracks[0])

    if (!track) return

    try {
        queue.play(track)
    } catch {
        console.log("再生エラー")
        return
    }

    const musicOverview = await fetchMusicOvewview(getYouTubeUrl(query))
    commandChannel.send({
        embeds: [
            generateEmbed(
                musicOverview.title,
                query,
                user,
                musicOverview.thumbnailUrl,
                musicOverview.author
            ),
        ],
    })
}

client.login(token)

const server = http.createServer((req, res) => {
    const url = req?.url || ""
    if (!url.startsWith("/add")) {
        res.statusCode = 404
        res.end(`There is no matched content for ${url}`)
        return
    }

    if (req.method === "OPTIONS") {
        res.statusCode = 200
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        res.setHeader(
            "Access-Control-Allow-Headers",
            "X-Requested-With, Content-Type"
        )
        res.end()
    } else if (req.method === "POST") {
        let body = ""
        req.on("data", (chunk) => {
            body += chunk
        })

        req.on("end", async () => {
            const content = JSON.parse(body)
            console.log("リクエスト", content)
            await addTrack(content.query, content.name)
            res.statusCode = 200
            res.end()
        })
    }
})

server.listen(PORT, HOST_NAME, () => {
    console.log(`Server running at http://${HOST_NAME}:${PORT}/`)
})
