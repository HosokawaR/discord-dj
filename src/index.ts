import { Client, Intents, Interaction } from "discord.js"
import { HOST_NAME, PORT, token } from "./config"
import { deployCommand, commands } from "./deploy-commands"
import { canCommandBot, commandTypeGard } from "./utls"
import * as http from "http"
import { addTrack } from "./addTrack"

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
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
