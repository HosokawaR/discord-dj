import { SlashCommandBuilder } from "@discordjs/builders"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import { clientId, guildId, token } from "./config"
import * as fs from "fs"
import { Command } from "./types"

const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith("js"))

// TODO: Webpack を用いた動的インポートに
export const commands = commandFiles.map(
    (file) => require(`./commands/${file}`).default
) as Command[]

const commandOverviews = commands.map((command) => command.overview)

const rest = new REST({ version: "9" }).setToken(token)

export const deployCommand = rest
    .put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commandOverviews,
    })
    .then(() => console.log("Successfully registered application commands."))
    .catch(console.error)
