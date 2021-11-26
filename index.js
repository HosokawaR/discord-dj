const { Routes } = require("discord-api-types/v9")
const { REST } = require("@discordjs/rest")
const { Client, Intents } = require("discord.js")
const { default: Collection } = require("@discordjs/collection")
const { clientId, guildId, token } = require("./config.json")
const { deployCommand, commands } = require("./deploy-commands")
const { Player } = require("discord-player")

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
})
const player = new Player(client)

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`)
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
