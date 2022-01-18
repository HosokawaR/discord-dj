import { SlashCommandBuilder } from "@discordjs/builders"
import * as Airtable from "airtable"
import { MessageEmbed } from "discord.js"
import { AIRTABLE_BASE, AIRTABLE_KEY } from "../config"
import { Command } from "../types"

const command: Command = {
    overview: new SlashCommandBuilder()
        .setName("ranking")
        .setDescription("再生ランキングを表示する"),
    async execute(interaction) {
        Airtable.configure({
            apiKey: AIRTABLE_KEY,
        })
        const base = Airtable.base(AIRTABLE_BASE)
        base("logs")
            .select({
                maxRecords: 10,
                view: "main",
            })
            .firstPage((err, records) => {
                const fields = records?.map((record, index) => ({
                    name: `${index + 1}位`,
                    value: record.get("name") as string,
                }))
                const embed = new MessageEmbed().addFields(...fields)
                interaction.channel?.send({
                    embeds: [embed],
                })
            })
    },
}

export default command
