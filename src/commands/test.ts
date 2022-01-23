import { SlashCommandBuilder } from "@discordjs/builders"
import { CacheType, CommandInteraction, Interaction } from "discord.js"
import { Command } from "../types"

const command: Command = {
    overview: new SlashCommandBuilder()
        .setName("test")
        .setDescription("テスト用コマンド"),
    async execute(interaction) {
        await interaction.reply({ content: "Hello World !" })
    },
}

export default command
