
import express from "express"
import {addPost, allPost, deletePost, likePost,repost,singlePost} from "../controller/post.js"
import {auth} from "../middleware/auth.js"
const router=express.Router()


router.use(auth)

router.post("/addPost",addPost)
router.get("/getPost",allPost)
router.put("/like/:id",likePost)
router.delete("/:id",deletePost)
router.put("/repost/:id", repost);
router.get("/:id", singlePost);


export default router