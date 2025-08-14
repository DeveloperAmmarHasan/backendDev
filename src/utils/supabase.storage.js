import fs from "fs";
import path from "path";
import { supabase } from "../../supabase.config.js";

const addSupabaseStorage = async (localFilePath) => {
	// Read file from local path into buffer
	const fileBuffer = fs.readFileSync(localFilePath);
	const fileName = path.basename(localFilePath);

	const { data: uploaded, error: uploadErr } = await supabase.storage
		.from("files") // bucket name in Supabase
		.upload(fileName, fileBuffer, {
			cacheControl: "3600",
			upsert: false,
		});
	if (uploadErr) throw new Error(uploadErr.message);

	return uploaded; // returns { path: "uploaded_file_name" }
};
const permanentDeleteSupabaseStorage = async (storagePath) => {
	//delete from storage
	const { data: file, error: storageErr } = await supabase.storage
		.from("files")
		.remove([`${storagePath}`]);

	if (storageErr) throw `CAN'T DELETE FILE ${storageErr.message}`;
};
const createSupabaseDownloadUrl = async (storagePath) => {
	//delete from storage
	const { data: Url, error: storageErr } = await supabase.storage
		.from("files")
		.createSignedUrl(`${storagePath}`, 60 * 60);
	if (storageErr) throw storageErr.message;
	return Url;
};

export {
	addSupabaseStorage,
	permanentDeleteSupabaseStorage,
	createSupabaseDownloadUrl,
};
