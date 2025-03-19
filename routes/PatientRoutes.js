import e from "express";
import { patientLogin, patientProfile, patientSignup, patientProfileUpdate, patientProfileDeactivate, patientLogout,
    countAppoinment, appoinmentList, requestAppoinment, cancelAppoinment, countBloodbank, getBloodbank, searchBloodbank
 } from "../controllers/patientControllers.js";
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

//count appoinments
router.get("/appoinment-count", authPatient, countAppoinment)
//bloodbank count
router.get("/bloodbank-count", authPatient, countBloodbank)
//list appoinments
router.get("/appoinment-list", authPatient, appoinmentList)
//request appoinments
router.put("/request", authPatient, requestAppoinment)
//cancel appoinments
router.delete("/cancel/:appoinmentId", authPatient, cancelAppoinment)
//fetch bloodbanks
router.get("/bloodbank", authPatient, getBloodbank)
//seacr bloodbanks
router.get("/search-bloodbank", authPatient, searchBloodbank)

export {router as patientRouter}