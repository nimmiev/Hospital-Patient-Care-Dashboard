import e from "express";
import { userSignup, userLogin, userProfile, userProfileUpdate, userLogout, profileDeactivate } from "../controllers/userControllers.js";
import { authUser } from "../middlewares/authUser.js"

const router = e.Router();

//signup
router.post("/signup", userSignup)
//login
router.put("/login", userLogin)
//get-profile
router.get("/profile", authUser, userProfile)
//edit-profile
router.put("/profile-update", authUser, userProfileUpdate)
//deactivate-profile
router.put("/deactivate", authUser, profileDeactivate)
//delete-profile
router.delete("/delete")
//logout
router.get("/logout", authUser, userLogout)
//forget-password
//change-password
//check-user

export { router as userRouter }