import e from "express";
import { doctorLogin, doctorProfile, doctorSignup } from "../controllers/doctorController.js";

const router = e.Router();

//signup
router.post("/signup", doctorSignup)
//login
router.put("/login", doctorLogin)
//get-profile
router.get("/profile", doctorProfile)
//edit-profile
router.put("/update")
//deactivate-profile
router.put("/deactivate")
//delete-profile
router.delete("/delete")
//logout
router.get("/logout")
//forget-password
//change-password
//check-user

export {router as doctorRouter}