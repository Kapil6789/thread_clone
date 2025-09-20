import jwt from "jsonwebtoken"

import prisma from "../prisma/connector.js";


const auth = async (req, res, next) => {
    try {
        const token = req.cookies["thread_token"];
        if (!token) {
            return res.status(401).json({ msg: "Please login before accessing the resources" })
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        if (!decodedToken) {
            return res.status(400).json({ msg: "error while decoding token in auth" })
        }

        // ensure numeric id for Prisma
        const userId = Number(decodedToken.id);
        if (Number.isNaN(userId)) {
            return res.status(400).json({ msg: "Invalid token payload" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
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

        req.user = { id: userId }
        next()

    }
    catch (error) {
        res.status(400).json({ msg: "error in auth", err: error.message })
    }
}

export { auth }