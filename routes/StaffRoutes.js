import e from "express";
import { staffLogin, staffProfile, staffSignup, staffProfileUpdate, staffProfiledeactivate, staffLogout,
    getTask, completedTask, updateTask, countBloodbank, getBloodbank, searchBloodbank, addPatient, getAppoinment,
    secureData
 } from "../controllers/staffController.js";
import { authStaff } from "../middlewares/authStaff.js";

const router = e.Router();

//signup
router.post("/signup", staffSignup)
//login
router.put("/login", staffLogin)
//get-profile
router.get("/profile", authStaff, staffProfile)
//edit-profile
router.put("/update", authStaff, staffProfileUpdate)
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
router.put("/update-task/:taskId", authStaff, updateTask)
// //bloodbank count
// router.get("/bloodbank-count", authStaff, countBloodbank)
// //fetch bloodbanks
// router.get("/bloodbank", authStaff, getBloodbank)
// //seacr bloodbanks
// router.get("/search-bloodbank", authStaff, searchBloodbank)
//add patient
router.post("/addPatient", authStaff, addPatient)
//fetch appoinment
router.get("/appoinment", authStaff, getAppoinment)
// sample route
router.get("/me", authStaff, secureData)


export {router as staffRouter}