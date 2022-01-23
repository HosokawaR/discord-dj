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

type Ranking = {
    name: string
    rate: number
}

export const fetchRatings = async () => {
    return new Promise<Ranking[]>((resolve, reject) => {
        base("logs")
            .select({
                maxRecords: 10,
                view: "byMusic",
                sort: [{ field: "averageRate", direction: "desc" }],
            })
            .firstPage((err, records) => {
                if (err) return reject({})
                const ranking =
                    records?.map((record) => {
                        const name = record.get("name")
                        const rate = record.get("averageRate")
                        return {
                            name: typeof name === "string" ? name : "",
                            rate: typeof rate === "number" ? rate : 0,
                        }
                    }) || []
                resolve(ranking)
            })
    })
}
