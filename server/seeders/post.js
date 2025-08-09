import { faker, simpleFaker } from "@faker-js/faker"
import prisma from "../prisma/connector.js"

const postByUser = async (numPost) => {
    try {
        const posts = []
         const users = await prisma.user.findMany({
                select: { id: true },
            });

        for (let i = 0; i < numPost; i++) {

           
            const admin = faker.helpers.arrayElement(users)
            const author = faker.helpers.arrayElement(users)


            const post = prisma.post.create({
                data: {
                    text: faker.lorem.word(3),
                    media: faker.datatype.boolean() ? faker.image.url() : null,
                    admin: {
                        connect: { id: admin.id }
                    },
                    author: {
                        connect: { id: author.id }
                    }
                }
            })
            posts.push(post)

        }

        await Promise.all(posts)
        console.log("post created", numPost)
        process.exit(0)

    }

    catch (err) {
        console.log("error", err)
        process.exit(1)
    }

}

export { postByUser }