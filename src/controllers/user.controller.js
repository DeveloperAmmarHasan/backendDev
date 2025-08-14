import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../../supabase.config.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signJWT } from "../utils/JWTSign.js";
import { addSupabaseStorage } from "../utils/supabase.storage.js";

const generateAccessAndRefreshTokens = async (userId) => {
	const access_token = await signJWT(
		{ userId },
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
	);
	const refresh_token = await signJWT(
		{ userId },
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
	);
	return { access_token, refresh_token };
};
const signUp = asyncHandler(async (req, res) => {
	const { email, password, fullname } = req.body;

	// Validate inputs
	if (!email || !password) {
		throw new ApiError(400, "Email and Password are required");
	}

	// Check if user exists
	const { data: existingUser, error: existingUserError } = await supabase
		.from("users")
		.select("id")
		.eq("email", email)
		.maybeSingle();

	if (existingUser) {
		throw new ApiError(400, "User already exists");
	}

	if (existingUserError && existingUserError.code !== "PGRST116") {
		// PGRST116 = no rows found
		throw new ApiError(
			400,
			`Supabase error: ${JSON.stringify(existingUserError)}`,
		);
	}

	// Check avatar file
	const avatarLocalPath = req.files?.avatar?.[0]?.path;
	if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

	// Upload avatar to Supabase Storage
	let avatar;
	try {
		avatar = await addSupabaseStorage(avatarLocalPath);
	} catch (error) {
		console.error("Error uploading file:", error.message);
		throw new ApiError(500, `Failed to upload avatar ${error.message}`);
	}

	// Hash password
	const password_hash = await bcrypt.hash(password, 10);

	// Insert into users table manually for custom data handling
	const { data: newUser, error: dbSignUpError } = await supabase
		.from("users")
		.insert([{ email, password_hash, fullname, avatar: avatar.url }])
		.select("id, email, fullname, avatar")
		.single();

	if (dbSignUpError) {
		throw new ApiError(
			500,
			`Supabase insert error: ${JSON.stringify(dbSignUpError)}`,
		);
	}

	// Generate token
	const token = jwt.sign(
		{ userId: newUser.id },
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
	);

	res.status(200).json({ token, user: newUser });
});

const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		throw new ApiError(400, "Email and Password are required");
	}
	const password_hash = await bcrypt.hash(password, 10);
	// Find user
	const { data: user, error: fetchError } = await supabase
		.from("users")
		.select("*")
		.eq("email", email)
		.single();

	if (fetchError || !user) {
		throw new ApiError(401, "Invalid credentials :: user");
	}

	// Check password
	const isValid = await bcrypt.compare(password, user.password_hash);
	if (!isValid) {
		throw new ApiError(401, "Invalid credentials :: password");
	}

	// Generate tokens
	const { access_token, refresh_token } = await generateAccessAndRefreshTokens(
		user.id,
	);

	// Save refresh token
	const { error: updateError } = await supabase
		.from("users")
		.update({ access_token: access_token })
		.eq("id", user.id)
		.select();

	if (updateError) {
		throw new ApiError(500, `DB Update Failed: ${updateError.message}`);
	}
	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	};

	res
		.status(200)
		.cookie("access_token", access_token, cookieOptions)
		.cookie("refresh_token", refresh_token, cookieOptions)
		.json(
			new ApiResponse(
				200,
				{
					user: { id: user.id, email: user.email, fullname: user.fullname },
					access_token,
					refresh_token,
				},
				"User Logged In successfully",
			),
		);
});
const logoutUser = asyncHandler(async (req, res) => {
	// console.log("req.user.id ",req.user.id)
	await supabase
		.from("users")
		.update({ access_token: "" })
		.eq("id", req.user.id)
		.select();

	// Cookie options
	const options = {
		httpOnly: true,
		secure: true,
	};
	res
		.status(200)
		.clearCookie("access_token", options)
		.clearCookie("refresh_token", options)
		.json(new ApiResponse(200, {}, "User logged out successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
	// console.log("req.user.id ",req.user.id)
	await supabase.from("users").delete().eq("id", req.user.id).select();

	// Cookie options
	const options = {
		httpOnly: true,
		secure: true,
	};
	res
		.status(200)
		.clearCookie("access_token", options)
		.clearCookie("refresh_token", options)
		.json(new ApiResponse(200, {}, "User deleted successfully"));
});
export { signUp, loginUser, logoutUser, deleteUser };
