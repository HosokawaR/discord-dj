const { Routes } = require("discord-api-types/v9")
const { REST } = require("@discordjs/rest")
const { Client, Intents } = require("discord.js")
const { default: Collection } = require("@discordjs/collection")
const { clientId, guildId, token } = require("./config.json")
const { deployCommand, commands } = require("./deploy-commands")
const Sequlize = require("sequelize")

const sequelize = new Sequlize({
  dialect: "sqlite",
  storage: "./database.sqlite",
})

const Musics = sequelize.define("musics", {
  url: {
    type: Sequlize.STRING,
    unique: true,
  },
  title: {
    type: Sequlize.STRING,
  },
  evalution: {
    type: Sequlize.INTEGER,
  },
})

exports.sequelize = sequelize
exports.Musics = Musics
