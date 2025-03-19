import e from "express";
import { staffLogin, staffProfile, staffSignup, staffProfileUpdate, staffProfiledeactivate, staffLogout,
    getTask, updateTask, countBloodbank, getBloodbank, searchBloodbank
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
router.get("/logout", authStaff, staffLogout)
//forget-password
//change-password
//check-user


//view task
router.get("/task", authStaff, getTask)
//complete-task
router.get("/update-task", authStaff, updateTask)
//bloodbank count
router.get("/bloodbank-count", authStaff, countBloodbank)
//fetch bloodbanks
router.get("/bloodbank", authStaff, getBloodbank)
//seacr bloodbanks
router.get("/search-bloodbank", authStaff, searchBloodbank)

export {router as staffRouter}