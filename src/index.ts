import express, { Application, Request, Response } from 'express';
import cors from "cors";
import dotenv from "dotenv";
// Router
import authorRouter from "./routers/author.router"
import articleRouter from "./routers/article.router"

// Load env
dotenv.config();
const PORT: string = process.env.PORT || "5555";

// Initialize express
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
    res.status(200).send("Hello world")
});

app.use("/api/accounts", authorRouter)
app.use("/api/articles", articleRouter)

// Start Server
app.listen(PORT, () => {
    console.log(`API RUNNING at http://localhost:${PORT}`);
});

