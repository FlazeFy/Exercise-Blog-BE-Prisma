import { sign } from "jsonwebtoken"

export const createToken = (data: { id: string | number }) => {
    return sign(data, process.env.SECRET || "secret", { expiresIn: "24h" })
}