import e from "express";
import { staffLogin, staffProfile, staffSignup } from "../controllers/staffController.js";

const router = e.Router();

//signup
router.post("/signup", staffSignup)
//login
router.put("/login", staffLogin)
//get-profile
router.get("/profile", staffProfile)
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

export {router as staffRouter}