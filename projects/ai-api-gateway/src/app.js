import express from "express";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

app.use(express.json());

app.use("/api/v1", aiRoutes)

export default app;