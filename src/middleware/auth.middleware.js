import jwt from "jsonwebtoken";
import { supabase } from "../../supabase.config.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = async (req, _res, next) => {
	try {
		const token =
			req.cookies?.access_token ||
			req.header("Authorization")?.replace("Bearer ", "");
		if (!token) throw new ApiError(401, "Unauthorized Request Error");

		const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		// console.log("decodedToken ",decodedToken.userId)

		const { data: user } = await supabase
			.from("users")
			.select("*")
			.eq("id", decodedToken.userId)
			.single();
		// console.log("user",user)

		if (!user) throw new ApiError(401, "Invalid Access Token");

		req.user = user;
		next();
	} catch (err) {
		throw new ApiError(401, err?.message || "Invalid Access Token");
	}
};
