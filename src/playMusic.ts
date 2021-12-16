import * as ytdl from "ytdl-core"

import {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from "@discordjs/voice"
import { BaseGuildVoiceChannel, Guild, VoiceChannel } from "discord.js"
import { getYouTubeUrl } from "./utls"

export const playMusic = async (
    guild: Guild,
    voiceChannel: VoiceChannel | BaseGuildVoiceChannel,
    musicId: string
) => {
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: true,
    })

    const stream = ytdl(getYouTubeUrl(musicId), { filter: "audioonly" })
    const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
    })
    const player = createAudioPlayer()

    player.play(resource)
    connection.subscribe(player)

    player.on(AudioPlayerStatus.Idle, () => console.log("再生終了"))
}
