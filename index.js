const { Routes } = require("discord-api-types/v9")
const { REST } = require("@discordjs/rest")
const { Client, Intents } = require("discord.js")
const { default: Collection } = require("@discordjs/collection")
const { clientId, guildId, token } = require("./config.json")
const { deployCommand, commands } = require("./deploy-commands")
const { Musics } = require("./setup-database")
const { where } = require("sequelize/dist")
const http = require("http")

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`)
  Musics.sync()
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
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "エラーが発生しました。" })
    }
  } else if (interaction.isSelectMenu()) {
    console.log(interaction)
    // await Musics.update({evalution: Number(interaction.values[0])}, where: {url: });
    await interaction.reply({ content: "評価を受け取りました。" })
  }
})
;(async () => await deployCommand)()

client.login(token)
