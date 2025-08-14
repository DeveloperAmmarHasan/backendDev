import { Router } from "express";
import {
	createDownloadUrl,
	deleteFile,
	fileUpload,
	getFiles,
	permanentDeleteFile,
	renameFile,
	restoreFile,
} from "../controllers/file.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.post("/uploadFile", verifyJWT, upload.single("file"), fileUpload);
router.get("/", verifyJWT, getFiles);
router.put("/:id/rename", verifyJWT, renameFile);
router.delete("/:id", verifyJWT, deleteFile);
router.put("/:id/restore", verifyJWT, restoreFile);
router.delete("/:id/permanent", verifyJWT, permanentDeleteFile);
router.get("/:id/download", verifyJWT, createDownloadUrl);

export default router;
