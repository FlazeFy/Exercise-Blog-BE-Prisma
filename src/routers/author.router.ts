import { Router } from "express"
import { postRegister, getLogin, putUpdateAccount } from "../controllers/author.controller"
import { verifyToken } from "../middleware/verifyToken"

const router = Router()

router.post("/register", postRegister)
router.patch("/update", verifyToken, putUpdateAccount)
router.get("/login", getLogin)

export default router
