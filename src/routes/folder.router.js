import { Router } from "express";
import {
	createFolder,
	deleteFolder,
	listFilesFolders,
	renameFolder,
} from "../controllers/folder.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router;

router.post("/", verifyJWT, createFolder);
router.get("/", verifyJWT, listFilesFolders);
router.put("/:id/rename", verifyJWT, renameFolder);
router.delete("/:id", verifyJWT, deleteFolder);

export default router;
