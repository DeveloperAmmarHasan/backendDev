import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

const app = express();
app.use(
	cors({
		origin: process.env.CORS_ORIGIN,
		credentials: true,
	}),
);
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "25kb" }));
app.use(express.static("public"));

import fileRouter from "./routes/file.router.js";
import folderRouter from "./routes/folder.router.js";
import userRoutes from "./routes/user.routes.js";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/files", fileRouter);
app.use("/api/v1/folders", folderRouter);
export { app };
