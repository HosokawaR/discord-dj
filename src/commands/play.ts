import { SlashCommandBuilder } from "@discordjs/builders"
import { addTrack } from "../addTrack"
import { Command } from "../types"

const command: Command = {
    overview: new SlashCommandBuilder()
        .setName("play")
        .setDescription("曲を再生")
        .addStringOption((option) =>
            option
                .setName("query")
                .setDescription("追加したい曲の URL")
                .setRequired(true)
        ),
    async execute(interaction) {
        const query = interaction.options.get("query")?.value
        if (typeof query !== "string") return
        const client = interaction.client
        await addTrack(client, query, interaction.user.username)
    },
}

export default command
