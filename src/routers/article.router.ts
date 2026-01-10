import { Router } from "express"
import { createArticle, deleteArticleById, updateArticleById } from "../controllers/article.controller"

const router = Router()

router.delete("/:id", deleteArticleById)
router.post("/", createArticle)
router.put("/:id", updateArticleById)

export default router
