import e from "express";

const router = e.Router();

// logined person access page

//view
router.get("/view")
//add
router.post("/add")
//edit
router.put("/update")
//delete
router.delete("/delete")

export {router as appoinmentRouter}