import e from "express";
import { doctorLogin, doctorProfile, doctorSignup, updateDoctorProfile, updateDoctorPassword, doctorprofileDeactivate, doctorLogout,
    countAppoinment, appoinmentList, cancelAppoinment, getPatient, getPatientDetails, addNotes, secureData, appointmentListForToday
 } from "../controllers/doctorController.js";
import { authDoctor } from "../middlewares/authDoctor.js"
import { upload } from "../middlewares/multer.js"

const router = e.Router();

//signup
router.post("/signup", doctorSignup)
//login
router.put("/login", doctorLogin)
//get-profile
router.get("/profile", authDoctor, doctorProfile)
//edit-profile
// router.put("/profile-update", authDoctor, doctorProfileUpdate)
router.put("/profile-update", authDoctor, upload.single("image"), updateDoctorProfile)
router.put("/pwd-update", authDoctor, updateDoctorPassword)
//deactivate-profile
router.put("/deactivate", authDoctor, doctorprofileDeactivate)
//delete-profile
router.delete("/delete")
//logout
router.put("/logout", authDoctor, doctorLogout)
//forget-password
//change-password
//check-user

//appoinment count
router.get("/appoinment-count", authDoctor, countAppoinment)
//list appoinments
router.get("/appoinment-list", authDoctor, appoinmentList)
// list today appoinments
router.get("/appointment/today", authDoctor, appointmentListForToday)
//fetch patients
router.get("/patient", authDoctor, getPatient)
//fetch patient details
router.get("/patient/:patientId", authDoctor, getPatientDetails)
//add patient notes and update completed schedule
router.post("/add-notes/:appoinmentId", authDoctor, addNotes)
//cancel appoinment
router.delete("/cancel/:appoinmentId", authDoctor, cancelAppoinment)
// sample route
router.get("/me", authDoctor, secureData)

export {router as doctorRouter}