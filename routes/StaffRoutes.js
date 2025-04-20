import e from "express";
import { staffLogin, staffProfile, staffSignup, updateStaffProfile, updateStaffPassword, staffProfiledeactivate, staffLogout,
    searchAppoinment, getTask, completedTask, updateTask, countBloodbank, getBloodbank, searchBloodbank, getAppoinment,
    secureData, getPatient, appointmentListForToday, taskForToday
 } from "../controllers/staffController.js";
import { authStaff } from "../middlewares/authStaff.js";
import { upload } from "../middlewares/multer.js"

const router = e.Router();

//signup
router.post("/signup", staffSignup)
//login
router.put("/login", staffLogin)
//get-profile
router.get("/profile", authStaff, staffProfile)
//edit-profile
// router.put("/update", authStaff, staffProfileUpdate)
router.put('/profile-update', authStaff, upload.single('image'), updateStaffProfile);
router.put('/pwd-update', authStaff, updateStaffPassword);
//deactivate-profile
router.put("/deactivate", authStaff, staffProfiledeactivate)
//delete-profile
router.delete("/delete")
//logout
router.put("/logout", authStaff, staffLogout)
//forget-password
//change-password
//check-user

//count completed task
router.get("/completedtaskCount", authStaff, completedTask)
//view task
router.get("/task", authStaff, getTask)
//update completed-task
router.put("/update/:taskId", authStaff, updateTask)
// //bloodbank count
router.get("/bloodbank-count", authStaff, countBloodbank)
//fetch bloodbanks
router.get("/bloodbank", authStaff, getBloodbank)
//seacr bloodbanks
router.get("/search-bloodbank", authStaff, searchBloodbank)
//add patient 
//fetch patient
router.get("/patient", authStaff, getPatient)
//fetch appoinment
router.get("/appoinment", authStaff, getAppoinment)
// search appoinment
router.get('/search-appoinment', authStaff, searchAppoinment)
// sample route
router.get("/me", authStaff, secureData)
// fetch today appoinments
router.get("/appoinmentToday", authStaff, appointmentListForToday)
// task for today
router.get("/taskForToday", authStaff, taskForToday)

export {router as staffRouter}