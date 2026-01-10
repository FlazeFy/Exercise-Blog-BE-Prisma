import { randomUUID } from "crypto"
import { Request, Response, NextFunction } from "express"
import { prisma } from "../config/prisma"
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

        // Response
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
        const token = "ABCD12345"

        // Response
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
