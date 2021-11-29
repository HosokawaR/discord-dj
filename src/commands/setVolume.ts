import { SlashCommandBuilder } from "@discordjs/builders"
import { Command } from "../types"
import { canCommandBot, hasOnlyGuildMember, isGuildMember } from "../utls"

const command: Command = {
    overview: new SlashCommandBuilder()
        .setName("setvolume")
        .setDescription("音量を設定")
        .addIntegerOption((option) =>
            option
                .setName("volume")
                .setDescription("追加したい曲の URL")
                .setRequired(true)
        ),
    async execute(interaction, player) {
        if (!hasOnlyGuildMember(interaction)) return

        if (!canCommandBot(interaction)) return

        await interaction.deferReply()
        const queue = player.getQueue(interaction.guildId)
        if (!queue || !queue.playing) {
            await interaction.followUp({
                content: "音楽が再生されていません。",
            })
            return
        }

        const volume =
            (interaction.options.get("volume")?.value as number) || 50
        if (volume < 0 || volume > 100) {
            await interaction.followUp({
                content: "音量は 0 以上 100 以下の間の整数で指定してください。",
            })
            return
        }
        const success = queue.setVolume(volume)

        await interaction.followUp({
            content: success
                ? `音量を ${volume} に設定しました。`
                : `ごめん。失敗した。`,
        })
    },
}

export default command
