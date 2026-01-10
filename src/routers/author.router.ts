import { Router } from "express"
import { postRegister, getLogin } from "../controllers/author.controller"

const router = Router()

router.post("/register", postRegister)
router.get("/login", getLogin)

export default router
