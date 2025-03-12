import e from "express";
import { staffLogin, staffProfile, staffSignup, staffProfileUpdate, staffProfiledeactivate, staffLogout } from "../controllers/staffController.js";
import { authStaff } from "../middlewares/authStaff.js";

const router = e.Router();

//signup
router.post("/signup", staffSignup)
//login
router.put("/login", staffLogin)
//get-profile
router.get("/profile", authStaff, staffProfile)
//edit-profile
router.put("/update", authStaff, staffProfileUpdate)
//deactivate-profile
router.put("/deactivate", authStaff, staffProfiledeactivate)
//delete-profile
router.delete("/delete")
//logout
router.get("/logout", authStaff, staffLogout)
//forget-password
//change-password
//check-user

export {router as staffRouter}