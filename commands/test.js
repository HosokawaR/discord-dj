const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
  overview: new SlashCommandBuilder()
    .setName("test")
    .setDescription("テスト用コマンド"),
  async execute(interaction) {
    await interaction.reply({ content: "Hello World !" })
  },
}
