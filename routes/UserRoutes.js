import e from "express"
import { userSignup, userLogin, userProfile, userProfileUpdate, userLogout, profileDeactivate, 
    countDoctor, getDoctor, getDoctorDetails, deleteDoctor, doctorApproval, doctorReject,
    countPatient, getPatient, getPatientDetails, deletePatient, addPatient, PatientAcceptRequest,
    countStaff, getStaff, getStaffDetails, deleteStaff, staffApproval, staffReject,
    countAppoinment, getAppoinment, getAppointmentDetails, getRealtimeAppoinment, addAppoinment, updateAppoinment, cancelAppoinment,
    countBloodbank, getBloodbank, addBloodbank, updateBloodbank, deleteBloodbank,
    getTask, editTask, getTaskById, addTask, deleteTask, editInstruction, getAdminList,
    searchBloodbank, searchDoctor, searchPatient, searchStaff, searchAppoinment, searchTask, getMessage
 } from "../controllers/userControllers.js"
import { authUser } from "../middlewares/authUser.js"
import { upload } from "../middlewares/multer.js"
import { Patient } from "../models/PatientModel.js";

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
router.put("/doctorApproval/:doctorId", authUser, doctorApproval)
//reject doctor
router.put("/doctorReject/:doctorId", authUser, doctorReject)
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
router.post("/addPatient", addPatient)
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
router.put("/staffApproval/:staffId", authUser, staffApproval)
//reject staff
router.put("/staffReject/:staffId", authUser, staffReject)
// ----------------------------------Appoinment Management-----------------------------------
//appoinment count
router.get("/appoinment-count", authUser, countAppoinment)
//fetch appoinment
router.get("/appoinment", authUser, getAppoinment)
// fetch real time appoinments - today
router.get("/appoinment/today", authUser, getRealtimeAppoinment)
//fetch appoinment details
router.get("/appoinment/:appointmentId", authUser, getAppointmentDetails)
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
//search bloodbank
router.get("/search-bloodbank", authUser, searchBloodbank);
// ----------------------------------Staff Task Management-----------------------------------
//Task list
router.get("/task", authUser, getTask)
//add Task
router.post("/add-task", authUser, addTask)
// fetch task by id
router.get("/task/:taskId", authUser, getTaskById)
//edit Task
router.post("/edit-task/:taskId", authUser, editTask)
//delete Task
router.delete("/delete-task/:taskId", authUser, deleteTask)
// ----------------------------------General Instruction Management-----------------------------------
//edit instruction
router.post("/editInstructions/:taskId", authUser, editInstruction)
// search doctor name
router.get("/searchDoctor", authUser, searchDoctor)
// search patient name
router.get("/searchPatient", authUser, searchPatient)
// search staff name
router.get("/searchStaff", authUser, searchStaff)
// search appoinment doctor/patient name
router.get("/searchAppoinment", authUser, searchAppoinment)
// search task by date
router.get("/search-task", authUser, searchTask)
// fetch contact messages
router.get("/message", authUser, getMessage)
// fetch admin list
router.get("/adminlist", authUser, getAdminList)
// accept request
router.put("/accept/:requestId", authUser, PatientAcceptRequest)

export { router as userRouter }