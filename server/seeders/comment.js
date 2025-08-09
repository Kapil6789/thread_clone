
import { faker, simpleFaker } from "@faker-js/faker"
import prisma from "../prisma/connector.js"

const comments= async(numComments)=>{

    try{
         const users = await prisma.user.findMany({
                select: { id: true },
            });
             const posts = await prisma.post.findMany({
                select: { id: true },
            });
        const totalComments=[]
    for (let i = 0; i < numComments; i++) {
        let author = faker.helpers.arrayElement(users)
        let post = faker.helpers.arrayElement(posts)
        const createComments= await prisma.comment.create({
            data: {
                text: faker.lorem.word(5),
                author: {connect:{id:author.id}},
                post: {connect:{id:post.id}}
            }
        })
        totalComments.push(createComments)
    }
    await Promise.all(totalComments)
    console.log("comments created successfully",numComments)
    process.exit(0)
    }
    catch(err){
        console.log(err)
        process.exit(1)
    } 
}

export {comments}