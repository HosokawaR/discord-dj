const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
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
    if (!interaction.member.voice.channelId)
      await interaction.reply({
        content: "You are not in a voice channel!",
        ephemeral: true,
      })
    if (
      interaction.guild.me.voice.channelId &&
      interaction.member.voice.channelId !==
        interaction.guild.me.voice.channelId
    )
      interaction.reply({
        content: "You are not in my voice channel!",
        ephemeral: true,
      })
    const query = interaction.options.get("query").value
    const queue = player.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel,
      },
    })

    // verify vc connection
    try {
      if (!queue.connection) queue.connect(interaction.member.voice.channel)
    } catch {
      queue.destroy()
      return interaction.reply({
        content: "Could not join your voice channel!",
        ephemeral: true,
      })
    }

    await interaction.deferReply()
    const track = await player
      .search(query, {
        requestedBy: interaction.user,
      })
      .then((x) => x.tracks[0])
    if (!track)
      return await interaction.followUp({
        content: `❌ | Track **${query}** not found!`,
      })

    queue.play(track)

    await interaction.followUp({
      content: `⏱️ | Loading track **${track.title}**!`,
    })
  },
}
