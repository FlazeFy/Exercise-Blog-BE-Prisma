import { Request, Response, NextFunction } from "express"
import { prisma } from "../config/prisma"

export const getAllArticles = async (req: Request, res: Response) => {
    try {
        // Body
        const { category, search, authorId } = req.query

        // Query
        const where: any = {}

        // Filter by category
        if (category) {
            where.category = String(category).toLowerCase()
        }

        // Filter by keyword (title or content)
        if (search) {
            const keyword = String(search)
            where.OR = [
                { title: { contains: keyword, mode: "insensitive" } },
                { content: { contains: keyword, mode: "insensitive" } },
            ]
        }

        // Filter by authorId
        if (authorId) {
            where.author_id = String(authorId)
        }

        // Query
        const result = await prisma.article.findMany({
            where,
            select: {
                id: true,
                title: true,
                category: true,
                author_id: true,
                created_at: true,
            },
            orderBy: {
                created_at: "desc",
            },
        })

        // Success response
        res.status(result.length > 0 ? 200 : 404).json({
            message: `Get articles ${result.length > 0 ? "successful" : "failed"}`,
            data: result.length > 0 ? result : null,
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            data: error,
        })
    }
}

export const getArticleById = async (req: Request, res: Response) => {
    try {
        // Param
        const id = req.params.id as string

        // Query
        const result = await prisma.article.findUnique({
            where: { id },
        })

        if (!result) {
            return res.status(404).json({
                message: "article not found",
                data: null,
            })
        }

        // Success response
        res.status(200).json({
            message: "Get article successful",
            data: result,
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            data: error,
        })
    }
}

export const createArticle = async (req: Request, res: Response) => {
    try {
        // Body
        const { title, category, content, authorId } = req.body

        // Validation: title length
        if (!title || title.length < 3) {
            return res.status(400).json({
                message: "Title must be at least 3 characters",
                data: null,
            })
        }

        // Validation: author Id must exists
        const checkAuthor = await prisma.author.findUnique({
            where: { id: authorId },
            select: { id: true },
        })

        if (!checkAuthor) {
            return res.status(400).json({
                message: "Invalid author Id: account not found",
                data: null,
            })
        }

        // Query
        const result = await prisma.article.create({
            data: {
                title,
                content,
                category,
                author_id: authorId,
            },
        })

        // Success response
        res.status(201).json({
            message: "Create article successful",
            data: result,
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            data: error,
        })
    }
}

export const updateArticleById = async (req: Request, res: Response) => {
    try {
        // Param & Body
        const id = req.params.id as string
        const { title, category, content, authorId } = req.body

        // Query
        const oldArticle = await prisma.article.findUnique({
            where: { id },
        })

        if (!oldArticle) {
            return res.status(404).json({
                message: "article not found",
                data: null,
            })
        }

        // Validation: title length
        if (title && title.length < 3) {
            return res.status(400).json({
                message: "Title must be at least 3 characters",
                data: null,
            })
        }

        // Validation: author Id must exists
        if (authorId) {
            const checkAuthor = await prisma.author.findUnique({
                where: { id: authorId },
                select: { id: true },
            })

            if (!checkAuthor) {
                return res.status(400).json({
                    message: "Invalid author Id: account not found",
                    data: null,
                })
            }
        }

        const updatedArticle = {
            title: title ?? oldArticle.title,
            content: content ?? oldArticle.content,
            category: category ?? oldArticle.category,
            author_id: authorId ?? oldArticle.author_id,
        }

        // Query
        const result = await prisma.article.update({
            where: { id },
            data: {
                ...updatedArticle,
                updated_at: new Date(),
            },
        })

        // Success response
        res.status(200).json({
            message: "Update article successful",
            data: result,
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            data: error,
        })
    }
}

export const deleteArticleById = async (req: Request, res: Response) => {
    try {
        // Param
        const id = req.params.id as string

        // Query
        const checkArticle = await prisma.article.findUnique({
            where: { id },
        })

        if (!checkArticle) {
            // Response
            return res.status(404).json({
                message: "article not found",
                data: null,
            })
        }

        // Query
        const result = await prisma.article.delete({
            where: { id },
        })

        // Success response
        res.status(200).json({
            message: "Delete article successful",
            data: result,
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            data: error,
        })
    }
}