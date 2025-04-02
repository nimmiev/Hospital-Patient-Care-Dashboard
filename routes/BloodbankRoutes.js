import e from "express";
import { countBloodbank, getBloodbank, addBloodbank, updateBloodbank, deleteBloodbank, searchBloodbank } from "../controllers/userControllers.js";
import { authUser } from "../middlewares/authUser.js"
import { authStaff } from "../middlewares/authStaff.js";

const router = e.Router();

// logined person access page

//bloodbank count
router.get("/bloodbank-count", authUser, authStaff, countBloodbank)
//fetch bloodbanks
router.get("/bloodbank", authUser, authStaff, getBloodbank)
//add bloodbank
router.post("/add-bloodbank", authUser, addBloodbank)
//update bloodbank
router.post("/update-bloodbank/:bloodbankId", authUser, updateBloodbank)
//delete bloodbank
router.delete("/delete-bloodbank/:bloodbankId", authUser, deleteBloodbank)
//search by blood group
router.get("/search-bloodbank", authUser, authStaff, searchBloodbank)

export {router as bloodbankRouter}