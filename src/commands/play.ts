import { SlashCommandBuilder } from "@discordjs/builders"
import { QueryType } from "discord-player"
import { botName } from "~/config"
import { Command } from "../types"
import { isGuildMember } from "../utls"

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
    async execute(interaction, player) {
        if (!isGuildMember(interaction.member)) return
        if (!interaction.member.voice.channelId)
            await interaction.reply({
                content:
                    "ボイスチャンネルに入室した状態でコマンドを入力してください。",
                ephemeral: true,
            })
        if (!interaction.guild) return
        if (
            interaction?.guild?.me?.voice.channelId &&
            interaction.member.voice.channelId !==
                interaction.guild.me.voice.channelId
        )
            interaction.reply({
                content: `${botName} と同じボイスチャンネルに入室した状態でコマンドを入力してください。`,
                ephemeral: true,
            })
        const query = interaction.options.get("query")?.value
        // TODO: 明示的なエラー
        if (!query || typeof query !== "string") return
        const queue = player.createQueue(interaction.guild, {
            metadata: {
                channel: interaction.channel,
            },
            ytdlOptions: {
                filter: "audioonly",
            },
            leaveOnEmpty: false,
            leaveOnEnd: false,
            leaveOnStop: false,
        })

        // verify vc connection
        try {
            if (!queue.connection && interaction.member.voice.channel)
                queue.connect(interaction.member.voice.channel)
        } catch {
            queue.destroy()
            interaction.reply({
                content:
                    "あなたと同じボイスチャンネルに参加することが出来ませんでした。",
                ephemeral: true,
            })
        }

        await interaction.deferReply()
        const track = await player
            .search(query, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_SEARCH,
            })
            .then((x) => x.tracks[0])
        if (!track)
            await interaction.followUp({
                content: `**${query}** が見つかりませんでした。`,
            })

        queue.play(track)

        await interaction.followUp({
            content: `**${track.title}** を再生中です。`,
        })
    },
}

export default command
