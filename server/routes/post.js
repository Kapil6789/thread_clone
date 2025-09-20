import express from "express"
import { addPost, deletePost, listPosts, likePost, repost, singlePost } from "../controller/post.js"
import { auth } from "../middleware/auth.js"
const router=express.Router()

router.use(auth)

router.post("/addPost",addPost)
router.get("/", listPosts)                // /api/v1/post?page=1
router.get("/:id", singlePost)
router.put("/like/:id",likePost)
router.put("/repost/:id", repost)
router.delete("/:id",deletePost)


export default router