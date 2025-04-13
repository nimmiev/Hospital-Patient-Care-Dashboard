import e from "express";
import { getInstruction, addInstruction, editInstruction, deleteInstruction } from "../controllers/userControllers.js";
import { authUser } from "../middlewares/authUser.js"
import { authPatient } from "../middlewares/authPatient.js";

const router = e.Router();

//fetch instruction
router.get("/", getInstruction)
//add instruction
router.post("/add", authUser, addInstruction)
// edit instruction
router.put("/edit/:id", authUser, editInstruction)
// delete instruction
router.delete("/delete/:id", authUser, deleteInstruction)

export { router as InstructionRouter }