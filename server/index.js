
import express from "express"
import userRouter from "./routes/user.js"
import postRouter from "./routes/post.js"
import commentRouter from "./routes/comments.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import {createUser} from "./seeders/user.js"
import {comments} from "./seeders/comment.js"
import {followers}  from "./seeders/follower.js"
import {postByUser} from "./seeders/post.js"
import {replies}  from "./seeders/replies.js"
import {repost} from "./seeders/repost.js"
import { likes } from "./seeders/like.js"
// createUser(1)
// comments(1)
// postByUser(1)
// followers(1)

// replies(1)
// repost(1)
// likes(1)

const app=express()

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use("/api/v1/user",userRouter)
app.use("/api/v1/post",postRouter)
app.use("/api/v1/comment",commentRouter)

app.listen(5000,()=>{
    console.log("server is running")
})