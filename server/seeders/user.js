import { faker, simpleFaker } from "@faker-js/faker"
import prisma from "../prisma/connector.js"
const createUser = async (numUsers) => {
    try {
        const userPromise = []
        for (let i = 0; i < numUsers; i++) {
            const tempUser =  prisma.user.create({
                data: {
                    username: faker.internet.username(),
                    email: faker.internet.email(),
                    password: "password",
                    bio: faker.lorem.sentence(),
                    public_id:faker.string.uuid()

                }
            })
            userPromise.push(tempUser)
        }
        await Promise.all(userPromise)
        console.log("user created", numUsers)
        process.exit(0)
    }
    catch (err) {
        console.log("error", err)
        process.exit(1)

    }
}



export { createUser }