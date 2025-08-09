import { faker, simpleFaker } from "@faker-js/faker"
import prisma from "../prisma/connector.js"
const replies = async (numReplies) => {
    try {
        const reply=[]
         const users = await prisma.user.findMany({
                select: { id: true },
            });
             const posts = await prisma.post.findMany({
                select: { id: true },
            });
        for (let i = 0; i < numReplies; i++) {
            const author = faker.helpers.arrayElement(users)
            const post = faker.helpers.arrayElement(posts)

            const createReply= prisma.reply.create({
                data:{
                text: faker.lorem.word(5),
                author: {connect:{id:author.id}},
                post: {connect:{id:post.id}}
                }
                

            })
            reply.push(createReply)

        }
        await Promise.all(reply)
        console.log("reply",reply)
        process.exit(0)
    }
    catch (err) {
        console.log(err)
        process.exit(1)
    }

}

export {replies}