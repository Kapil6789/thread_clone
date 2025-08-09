

import express from "express"
import {addComments, deleteComment} from "../controller/comment.js"
import {auth} from "../middleware/auth.js"
const router=express.Router()


router.use(auth)

router.post("/addComment/:id",addComments)
router.delete("/deleteComment/:postId/:id",deleteComment)


export default router