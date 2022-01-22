import * as Airtable from "airtable"
import { User } from "discord.js"
import { AIRTABLE_KEY, AIRTABLE_BASE } from "./config"

Airtable.configure({
    apiKey: AIRTABLE_KEY,
})

const base = Airtable.base(AIRTABLE_BASE)

export const addMusicLog = async (
    musicId: string,
    musicName: string,
    createUser: string
) => {
    const record = await base("logs").create({
        id: musicId,
        name: musicName,
        create_by: createUser,
    })
    return record.getId()
}

export const addRating = async (
    reactions: Map<User, number>,
    recordId: string
) => {
    await base("reviews").create(
        Array.from(reactions).map(([user, rating]) => ({
            fields: {
                rating,
                create_by: user.username,
                music: [recordId],
            },
        }))
    )
}
