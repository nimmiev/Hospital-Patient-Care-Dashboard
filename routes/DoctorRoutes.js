import e from "express";
import { doctorLogin, doctorProfile, doctorSignup, doctorProfileUpdate, doctorprofileDeactivate, doctorLogout,
    countAppoinment, appoinmentList, cancelAppoinment, getPatient, getPatientDetails, addNotes
 } from "../controllers/doctorController.js";
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

//appoinment count
router.get("/appoinment-count", authDoctor, countAppoinment)
//list appoinments
router.get("/appoinment-list", authDoctor, appoinmentList)
//fetch patients
router.get("/patient", authDoctor, getPatient)
//fetch patient details
router.get("/patient/:patientId", authDoctor, getPatientDetails)
//add patient notes and update completed schedule
router.post("/add-notes/:appoinmentId", authDoctor, addNotes)
//cancel appoinment
router.delete("/cancel/:appoinmentId", authDoctor, cancelAppoinment)

export {router as doctorRouter}