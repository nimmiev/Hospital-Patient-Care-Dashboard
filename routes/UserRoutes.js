import e from "express";
import { userSignup, userLogin, userProfile, userProfileUpdate, userLogout, profileDeactivate, 
    countDoctor, getDoctor, getDoctorDetails, deleteDoctor, doctorApproval,
    countPatient, getPatient, getPatientDetails, deletePatient, addPatient,
    countStaff, getStaff, getStaffDetails, deleteStaff, staffApproval,
    countAppoinment, getAppoinment, addAppoinment, updateAppoinment, cancelAppoinment,
    countBloodbank, getBloodbank, addBloodbank, updateBloodbank, deleteBloodbank,
    getTask, editTask, addTask, deleteTask, editInstruction
 } from "../controllers/userControllers.js";
import { authUser } from "../middlewares/authUser.js"
import { upload } from "../middlewares/multer.js";

const router = e.Router();

//signup
router.post("/signup", upload.single("profilepic"), userSignup)
//login
router.put("/login", userLogin)
//get-profile
router.get("/profile", authUser, userProfile)
//edit-profile
// router.put("/profile-update", authUser, userProfileUpdate)
router.put("/profile-update", authUser, upload.single("profilepic"), userProfileUpdate);
//deactivate-profile
router.put("/deactivate", authUser, profileDeactivate)
//delete-profile
router.delete("/delete")
//logout
router.put("/logout", authUser, userLogout)
//forget-password
//change-password
//check-user
// ----------------------------------Doctor Management-----------------------------------
//count doctor
router.get("/count-doctor", authUser, countDoctor)
//fetch doctors
router.get("/doctors", authUser, getDoctor)
//fetch doctor details
router.get("/doctor/:doctorId", authUser, getDoctorDetails)
//delete doctor
router.delete("/doctor/:doctorId", authUser, deleteDoctor)
//approve doctor
router.put("/doctor/:doctorId", authUser, doctorApproval)
// ----------------------------------Patient Management-----------------------------------
//count patients
router.get("/patient-count", authUser, countPatient)
//fetch patients
router.get("/patient", authUser, getPatient)
//fetch patient details
router.get("/patient/:patientId", authUser, getPatientDetails)
//delete patient
router.delete("/patient/:patientId", authUser, deletePatient)
//add patient
router.post("/add-patient", authUser, addPatient)
// ----------------------------------Staff Management-----------------------------------
//count staff
router.get("/staff-count", authUser, countStaff)
//fetch staffs
router.get("/staff", authUser, getStaff)
//fetch staff details
router.get("/staff/:staffId", authUser, getStaffDetails)
//delete staff
router.delete("/staff/:staffId", authUser, deleteStaff)
//approve staff
router.put("/staff/:staffId", authUser, staffApproval)
// ----------------------------------Appoinment Management-----------------------------------
//appoinment count
router.get("/appoinment-count", authUser, countAppoinment)
//fetch appoinment
router.get("/appoinment", authUser, getAppoinment)
//add appoinment
router.post("/schedule", authUser, addAppoinment)
//reshedule appoinment
router.post("/reschedule/:appoinmentId", authUser, updateAppoinment)
//cancel appoinment
router.delete("/cancel/:appoinmentId", authUser, cancelAppoinment)
// ----------------------------------Bloodbank Management-----------------------------------
//bloodbank count
router.get("/bloodbank-count", authUser, countBloodbank)
//fetch bloodbanks
router.get("/bloodbank", authUser, getBloodbank)
//add bloodbank
router.post("/add-bloodbank", authUser, addBloodbank)
//update bloodbank
router.post("/update-bloodbank/:bloodbankId", authUser, updateBloodbank)
//delete bloodbank
router.delete("/delete-bloodbank/:bloodbankId", authUser, deleteBloodbank)
// ----------------------------------Staff Task Management-----------------------------------
//Task list
router.get("/task", authUser, getTask)
//add Task
router.post("/add-task", authUser, addTask)
//edit Task
router.post("/edit-task/:taskId", authUser, editTask)
//delete Task
router.delete("/delete-task/:taskId", authUser, deleteTask)
// ----------------------------------General Instruction Management-----------------------------------
//edit instruction
router.post("/editInstructions/:taskId", authUser, editInstruction)

export { router as userRouter }