import { GuildMember, MessageEmbed } from "discord.js"
import { getYouTubeUrl } from "./utls"

export const generateEmbed = (
    title: string,
    movieId: string,
    user: GuildMember,
    imageUrl: string,
    movieAuthor: string
) =>
    new MessageEmbed()
        .setColor("#00bfff")
        .setTitle(title)
        .setURL(getYouTubeUrl(movieId))
        .setAuthor(`${user.displayName} が追加しました`, user.avatarURL() || "")
        .setDescription(movieAuthor)
        .setThumbnail(imageUrl)
        .setFooter(
            "この曲は Music Library for YouTube によって追加されました。"
        )
