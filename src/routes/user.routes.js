import { Router } from "express";
import {
	deleteUser,
	loginUser,
	logoutUser,
	signUp,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.post("/register", signUp);
router
	.route("/login")
	.post(upload.fields([{ name: "avatar", maxCount: 1 }]), loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/deleteUser", verifyJWT, deleteUser);

export default router;
