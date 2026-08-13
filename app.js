import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import eventRoutes from "./routes/eventRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Cheptulu backend is running." });
});

app.use("/api/admin", authRoutes);
app.use("/api/events", eventRoutes);

export default app;