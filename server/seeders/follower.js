import { faker, simpleFaker } from "@faker-js/faker"
import prisma from "../prisma/connector.js"

const followers = async (followUser) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true },
        });
        const followerPairs = new Set()
        const createFollowers = []
        for (let i = 0; i < followUser; i++) {
            let follower = faker.helpers.arrayElement(users)
            let following = faker.helpers.arrayElement(users)

            while (follower.id === following.id || followerPairs.has(`${follower.id}-${following.id}`)) {
                following = faker.helpers.arrayElement(users)
            }

            followerPairs.add(`${follower.id}-${following.id}`)

            const totalFollowers = prisma.followers.create({
                data: {
                    follower: { connect: { id: follower.id } },
                    following: { connect: { id: following.id } }
                }

            })
            createFollowers.push(totalFollowers)

        }
        await Promise.all(createFollowers)
        console.log("followers are created", followUser)
        process.exit(0)
    }
    catch (err) {
        console.log("error", err)
        process.exit(1)
    }
}

export { followers }