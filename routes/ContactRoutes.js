// routes/contactRoutes.js
import e from 'express';
import { contactMessage } from "../controllers/userControllers.js";

const router = e.Router();

router.post("/", contactMessage);

export default router;