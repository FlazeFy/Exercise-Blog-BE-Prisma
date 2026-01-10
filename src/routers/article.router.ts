import { Router } from "express"
import { createArticle, deleteArticleById, getAllArticles, getArticleById, updateArticleById } from "../controllers/article.controller"

const router = Router()

router.get("/", getAllArticles)
router.get("/:id", getArticleById)
router.delete("/:id", deleteArticleById)
router.post("/", createArticle)
router.put("/:id", updateArticleById)

export default router
