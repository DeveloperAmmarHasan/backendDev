import { supabase } from "../../supabase.config.js";

async function connectDB() {
	try {
		const { data, error } = await supabase.from("users").select("*");
		console.log("data : ", data);
		console.log("Error in DB : ", error);
	} catch (error) {
		console.log("Error connecting to db", error.message);
	}
}
export { connectDB };
