import e from "express";
import { patientLogin, patientProfile, patientSignup } from "../controllers/patientControllers.js";

const router = e.Router();

//signup
router.post("/signup", patientSignup)
//login
router.put("/login", patientLogin)
//get-profile
router.get("/profile", patientProfile)
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

export {router as patientRouter}