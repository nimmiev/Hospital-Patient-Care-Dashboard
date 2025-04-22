import e from "express";
import { patientLogin, patientProfile, patientSignup, updatePatientProfile, updatePatientPassword, patientProfileDeactivate, patientLogout,
    countAppoinment, appoinmentList, requestAppoinment, cancelAppoinment, countBloodbank, getBloodbank, searchBloodbank,
    secureData, appointmentListForToday, getDoctors
 } from "../controllers/patientControllers.js";
import { authPatient } from "../middlewares/authPatient.js";
import { upload } from "../middlewares/multer.js"

const router = e.Router();

//signup
router.post("/signup", patientSignup)
//login
router.put("/login", patientLogin)
//get-profile
router.get("/profile", authPatient, patientProfile)
//edit-profile
// router.put("/update", authPatient, patientProfileUpdate)

router.put("/profile/update", authPatient, upload.single("profilepic"), updatePatientProfile);
router.put("/profile/password", authPatient, updatePatientPassword);

//deactivate-profile
router.put("/deactivate", authPatient, patientProfileDeactivate)
//delete-profile
router.delete("/delete")
//logout
router.put("/logout", authPatient, patientLogout)
//forget-password
//change-password
//check-user

//count appoinments
router.get("/appoinment-count", authPatient, countAppoinment)
//bloodbank count
router.get("/bloodbank-count", authPatient, countBloodbank)
//list appoinments
router.get("/appoinment-list", authPatient, appoinmentList)
// list today appoinments
router.get("/appointment/today", authPatient, appointmentListForToday)
//request appoinments
router.post("/request", authPatient, requestAppoinment)
//cancel appoinments
router.delete("/cancel/:appoinmentId", authPatient, cancelAppoinment)
//fetch bloodbanks
router.get("/bloodbank", authPatient, getBloodbank)
//seacr bloodbanks
router.get("/search-bloodbank", authPatient, searchBloodbank)
// sample route
router.get("/me", authPatient, secureData)
// fetch doctors
router.get("/doctors", authPatient, getDoctors)


export {router as patientRouter}