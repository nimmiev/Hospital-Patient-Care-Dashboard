import e from "express";
import { userRouter } from "./UserRoutes.js";
import { patientRouter } from "./PatientRoutes.js";
import { doctorRouter } from "./DoctorRoutes.js";
import { staffRouter } from "./StaffRoutes.js";
import { appoinmentRouter } from "./AppoinmentRoutes.js";
import { bloodbankRouter } from "./BloodbankRoutes.js";
import contactRouter from "./ContactRoutes.js";
import { taskRouter } from "./TaskRoutes.js";

const router = e.Router();
router.use("/contact", contactRouter)
router.use("/admin", userRouter)
router.use("/patient", patientRouter)
router.use("/doctor", doctorRouter)
router.use("/staff", staffRouter)
router.use("/appoinment", appoinmentRouter)
router.use("/bloodbank", bloodbankRouter)
router.use("/task", taskRouter)

export {router as apiRouter}