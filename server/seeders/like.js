import { faker, simpleFaker } from "@faker-js/faker"
import prisma from "../prisma/connector.js"


const likes = async (numLikes) => {
       const users = await prisma.user.findMany({
            select: { id: true },
        });
        const posts = await prisma.post.findMany({
            select: { id: true },
        });
         const comments = await prisma.comment.findMany({
            select: { id: true },
        });

    try {
        const like = []
     
        for (let i = 0; i < numLikes; i++) {
            const user = faker.helpers.arrayElement(users);
            const post = faker.helpers.arrayElement(posts);
            const comment = faker.helpers.arrayElement(comments);


            like.push(prisma.like.create({
                data: {
                    user:{connect:{id:user.id}},
                    post:{connect:{id: post.id}},
                    comment:{connect:{id: comment.id}}

                }
            }))

        }
        await Promise.all(like)
        console.log("like created", like)
        process.exit(0)
    }
    catch (err) {
        console.log(err)
    }


}

export { likes }
