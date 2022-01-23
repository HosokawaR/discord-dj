import { SlashCommandBuilder } from "@discordjs/builders"
import * as Airtable from "airtable"
import { MessageEmbed } from "discord.js"
import { fetchRatings } from "../airtable"
import { AIRTABLE_BASE, AIRTABLE_KEY } from "../config"
import { Command } from "../types"

type Log = { name: string; rate: 0 }

const averageByMusic = (logs: Log[]) => { }

const command: Command = {
    overview: new SlashCommandBuilder()
        .setName("ranking")
        .setDescription("再生ランキングを表示する"),
    async execute(interaction) {
        const ranking = await fetchRatings()

        if (!ranking)
            return interaction.reply({
                content: "ランキングの失敗に取得しました",
            })

        const fields = ranking.map((r) => ({
            name: r.name,
            value: "平均得評価: " + String(r.rate),
        }))

        const embed = new MessageEmbed()
            .setTitle("投票ランキング")
            .addFields(...fields)

        interaction.channel?.send({
            embeds: [embed],
        })

        interaction.reply({ content: "投票ランキングを取得中…" })
    },
}

export default command
