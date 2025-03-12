import e from "express";
import { doctorLogin, doctorProfile, doctorSignup, doctorProfileUpdate, doctorprofileDeactivate, doctorLogout } from "../controllers/doctorController.js";
import { authDoctor } from "../middlewares/authDoctor.js"

const router = e.Router();

//signup
router.post("/signup", doctorSignup)
//login
router.put("/login", doctorLogin)
//get-profile
router.get("/profile", authDoctor, doctorProfile)
//edit-profile
router.put("/profile-update", authDoctor, doctorProfileUpdate)
//deactivate-profile
router.put("/deactivate", authDoctor, doctorprofileDeactivate)
//delete-profile
router.delete("/delete")
//logout
router.get("/logout", authDoctor, doctorLogout)
//forget-password
//change-password
//check-user

export {router as doctorRouter}