import { randomUUID } from "crypto"
import { Request, Response, NextFunction } from "express"
import { prisma } from "../config/prisma"
import { createToken } from "../helpers/createToken"
import { hashPassword, verifyPassword } from "../helpers/hashing"

export const postRegister = async (req: Request, res: Response) => {
    try {
        // Body
        const { name, email, password } = req.body

        // Validation: name required
        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: "Name cannot be empty",
                data: null,
            })
        }

        // Validation: email unique
        const checkEmail = await prisma.author.findUnique({
            where: { email },
            select: { id: true },
        })

        if (checkEmail) {
            return res.status(400).json({
                message: "Email already registered",
                data: null,
            })
        }

        // Hashing
        const { hash, salt } = hashPassword(password)

        // Query
        const result = await prisma.author.create({
            data: {
                id: randomUUID(),
                name,
                email,
                password: hash,
                salt,
            },
            select: {
                id: true,
                name: true,
                email: true,
                created_at: true,
            },
        })

        // Success response
        res.status(201).json({
            message: "Register successful",
            data: result,
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            data: error,
        })
    }
}

export const getLogin = async (req: Request, res: Response) => {
    try {
        // Body
        const { email, password } = req.body

        // Query
        const account = await prisma.author.findUnique({
            where: { email },
        })

        // Validation: email exists
        if (!account) {
            return res.status(404).json({
                message: "Email not found",
                data: null,
            })
        }

        // Validation: password match
        const isValid = verifyPassword(password, account.password, account.salt)
        if (!isValid) {
            return res.status(400).json({
                message: "Invalid password",
                data: null,
            })
        }

        // Dummy token
        const token = createToken({ id: account.id })

        // Success response
        const { password: _, salt: __, ...safeAccount } = account
        res.status(200).json({
            message: "Login successful",
            data: {
                user: safeAccount,
                token,
            },
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            data: error,
        })
    }
}

export const putUpdateAccount = async (req: Request, res: Response) => {
    try {
        // Params
        const authorId = res.locals.decript.id
        const { name, email, password } = req.body

        // Validation : Make sure there's a changes
        if (!name && !email && !password) {
            return res.status(400).json({
                message: "No data to update",
                data: null,
            })
        }

        // Validation : Name cant empty
        if (name && name.trim() === "") {
            return res.status(400).json({
                message: "Name cannot be empty",
                data: null,
            })
        }

        // Validation : Email must unique
        if (email) {
            const checkEmail = await prisma.author.findFirst({
                where: {
                    email,
                    NOT: { id: authorId },
                },
                select: { id: true },
            })

            if (checkEmail) {
                return res.status(400).json({
                    message: "Email already used",
                    data: null,
                })
            }
        }

        const updateData: any = {}
        if (name) updateData.name = name
        if (email) updateData.email = email
        if (password) {
            const { hash, salt } = hashPassword(password)
            updateData.password = hash
            updateData.salt = salt
        }

        // Query
        const result = await prisma.author.update({
            where: { id: authorId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                created_at: true
            },
        })

        // Success response
        res.status(200).json({
            message: "Account updated successfully",
            data: result,
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            data: null,
        })
    }
}
