
import express from "express"
import {signUpUser,loginUser, userDetails, followUser,logout, updateProfile,searchUser,myInfo} from "../controller/user.js"
import {auth} from "../middleware/auth.js"
const router=express.Router()

router.post("/signin",signUpUser)

router.post("/login",loginUser)
router.post("/logout",logout)

router.use(auth)
router.get("/me",myInfo)
router.put("/update",updateProfile)
router.get("/search/:query",searchUser)
router.put("/follow/:id",followUser)
router.get("/:id",userDetails)


export default router