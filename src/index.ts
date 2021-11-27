import { Client, Intents } from "discord.js"
import { clientId, guildId, token } from "./config"
import { deployCommand, commands } from "./deploy-commands"
import { Player } from "discord-player"
import { isGuildMember } from "./utls"

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
            await command.execute(interaction, player)
        } catch (error) {
            console.error(error)
            await interaction.reply({ content: "エラーが発生しました。" })
        }
    }
})
;(async () => await deployCommand)()

client.login(token)
