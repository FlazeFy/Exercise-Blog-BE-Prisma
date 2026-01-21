import { Router } from "express"
import { postRegister, postLogin, putUpdateAccount, postRefreshToken } from "../controllers/author.controller"
import { verifyToken } from "../middleware/verifyToken"

const router = Router()

router.post("/register", postRegister)
router.patch("/update", verifyToken, putUpdateAccount)
router.post("/login", postLogin)
router.get("/refresh", postRefreshToken)

export default router
