
import jwt from "jsonwebtoken"

import prisma from "../prisma/connector.js";


const auth = async (req, res, next) => {
    try {
        const token = req.cookies["thread_token"];
        if (!token) {
            return res.status(400).json({ msg: "Please login before accessing the resources" })
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        if (!decodedToken) {
            return res.status(400).json({ msg: "error while decoding token in auth" })
        }

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.id },
            include: {
                followers: true,
                threads: true,
                replies: true,
                reposts:true
            },
        });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        req.user = { id: decodedToken.id }
        next()

    }
    catch (error) {
        res.status(400).json({ msg: "error in auth", err: error.message })
    }
}

export { auth }