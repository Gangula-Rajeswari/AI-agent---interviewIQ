import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDb from "./config/connectDb.js";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";

import paymentRouter from "./routes/payment.route.js";

const app = express();

app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);

// 🔥 START SERVER AFTER DB CONNECT
const startServer = async () => {
    try {
        await connectDb();
        app.listen(8000, () => {
            console.log("🚀 Server running on port 8000");
        });
    } catch (error) {
        console.log("DB connection failed:", error);
    }
};

startServer();