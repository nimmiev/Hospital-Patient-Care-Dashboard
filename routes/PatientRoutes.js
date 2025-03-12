import e from "express";
import { patientLogin, patientProfile, patientSignup, patientProfileUpdate, patientProfileDeactivate, patientLogout } from "../controllers/patientControllers.js";
import { authPatient } from "../middlewares/authPatient.js";

const router = e.Router();

//signup
router.post("/signup", patientSignup)
//login
router.put("/login", patientLogin)
//get-profile
router.get("/profile", authPatient, patientProfile)
//edit-profile
router.put("/update", authPatient, patientProfileUpdate)
//deactivate-profile
router.put("/deactivate", authPatient, patientProfileDeactivate)
//delete-profile
router.delete("/delete")
//logout
router.get("/logout", authPatient, patientLogout)
//forget-password
//change-password
//check-user

export {router as patientRouter}