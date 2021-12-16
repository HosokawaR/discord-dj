import { Client, Intents } from "discord.js"
import { HOST_NAME, PORT, token } from "./config"
import { deployCommand, commands } from "./deploy-commands"
import { canCommandBot, commandTypeGard } from "./utls"
import * as http from "http"
import { addTrack } from "./addTrack"

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
})

client.login(token)

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
            await command.execute(interaction)
        } catch (error) {
            console.error(error)
            await interaction.reply({ content: "エラーが発生しました。" })
        }
    }
})
;(async () => await deployCommand)()

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
            await addTrack(client, content.query, content.name)
            res.statusCode = 200
            res.end()
        })
    }
})

server.listen(PORT, HOST_NAME, () => {
    console.log(`Server running at http://${HOST_NAME}:${PORT}/`)
})
