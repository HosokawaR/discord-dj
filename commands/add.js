const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageActionRow, MessageSelectMenu } = require("discord.js")
const { Musics } = require("../setup-database")

module.exports = {
  overview: new SlashCommandBuilder()
    .setName("add")
    .setDescription("曲を追加する")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("追加したい曲の URL")
        .setRequired(true)
    ),
  async execute(interaction) {
    const musicUrl = interaction.options.getString("url")
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("evalution")
        .setPlaceholder("この曲の評価を入力してください。")
        .addOptions([
          { label: "1", value: "1" },
          { label: "2", value: "2" },
          { label: "3", value: "3" },
        ])
    )
    try {
      const music = await Musics.create({
        url: musicUrl,
        title: "テスト曲名タイトル",
        evalution: 0,
      })
      await interaction.reply({ content: `追加しました。`, components: [row] })
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        interaction.reply({ content: "その曲は既に追加されています。" })
      } else {
        interaction.reply({ content: "エラーが発生しました。" })
      }
    }
  },
}
