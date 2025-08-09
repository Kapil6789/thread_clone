import { faker, simpleFaker } from "@faker-js/faker"
import prisma from "../prisma/connector.js"

const repost = async (numReposts) => {
    try {
        const repostPairs = new Set()
         const users = await prisma.user.findMany({
                select: { id: true },
            });
             const posts = await prisma.post.findMany({
                select: { id: true },
            });
        const totalRepost=[]
        for (let i = 0; i < numReposts; i++) {
            const user = faker.helpers.arrayElement(users)
            const post = faker.helpers.arrayElement(posts)

            const pairKey = `${user.id}-${post.id}`
            if (repostPairs.has(pairKey)){ 
                continue
            }
            repostPairs.add(pairKey)

            totalRepost.push(prisma.repost.create({
                data: {
                    user: {connect:{id:user.id}},
                    post: {connect:{id:post.id}},
                },
            }))
        }
         await Promise.all(totalRepost)
        console.log("reply",numRepost)
        process.exit(1)
    }
    catch (err) {
        console.log(err)
    }
}

export {repost}
