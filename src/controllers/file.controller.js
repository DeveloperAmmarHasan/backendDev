import { supabase } from "../../supabase.config.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
	addSupabaseStorage,
	createSupabaseDownloadUrl,
	permanentDeleteSupabaseStorage,
} from "../utils/supabase.storage.js";

const fileUpload = asyncHandler(async (req, res) => {
	const { folder_id } = req.body;
	if (!req.file)
		return res
			.status(400)
			.json({ error: "No file provided! Please provide a file first" });

	const uploaded = await addSupabaseStorage(req.file.path);
	console.log(uploaded);

	const { data, error } = await supabase
		.from("files")
		.insert([
			{
				fileName: req.file.originalname,
				owner_id: req.user.id,
				size: req.file.size,
				is_deleted: false,
				mime_type: req.file.mimetype,
				storage_path: uploaded.path,
				folder_id: folder_id || null,
			},
		])
		.select("*")
		.single();
	if (error) throw error.message || "file can't be uploaded";

	res
		.status(200)
		.json(new ApiResponse(200, "File has been uploaded successfully"));
});

const getFiles = asyncHandler(async (req, res) => {
	const { data, error } = await supabase
		.from("files")
		.select("*")
		.eq("owner_id", req.user.id)
		.eq("is_deleted", false)
		.order("created_at", { ascending: false });
	if (error) throw error.message;
	res.status(200).json(new ApiResponse(200, data, "files has been listed"));
});

const renameFile = asyncHandler(async (req, res) => {
	const { fileName } = req.body;

	const { data, error } = await supabase
		.from("files")
		.update({ fileName: fileName })
		.eq("id", req.params.id)
		.eq("owner_id", req.user.id)
		.select("*")
		.single();
	if (error) throw error;
	res.json(new ApiResponse(200, data, "file has been renamed"));
});
const deleteFile = asyncHandler(async (req, res) => {
	const { data, error } = await supabase
		.from("files")
		.update({ is_deleted: true })
		.eq("id", req.params.id)
		.eq("owner_id", req.user.id)
		.select("*")
		.single();
	if (error) throw error;
	res.json(new ApiResponse(200, { file: data }, "file moved to trash"));
});
const restoreFile = asyncHandler(async (req, res) => {
	const { data, error } = await supabase
		.from("files")
		.update({ is_deleted: false })
		.eq("id", req.params.id)
		.eq("owner_id", req.user.id)
		.select("*")
		.single();
	if (error) throw error;
	res.json(new ApiResponse(200, { file: data }, "file moved to trash"));
});
const permanentDeleteFile = asyncHandler(async (req, res) => {
	//remove from database
	const { data: file, error: fetchError } = await supabase
		.from("files")
		.select("storage_path")
		.eq("id", req.params.id)
		.eq("owner_id", req.user.id)
		.single();
	if (fetchError)
		throw new ApiError(400, ` file can't be fetched ${fetchError.message}`);

	//delete from storage container
	await permanentDeleteSupabaseStorage(`${file.storage_path}`);

	const { error: dbError } = await supabase
		.from("files")
		.delete()
		.eq("id", req.params.id)
		.eq("owner_id", req.user.id);
	if (dbError)
		throw new ApiError(400, `file can't be deleted from db ${dbError.message}`);

	res.json({ message: "File is permanently deleted" });
});
const createDownloadUrl = asyncHandler(async (req, res) => {
	const { data: file, error: fetchError } = await supabase
		.from("files")
		.select("storage_path")
		.eq("id", req.params.id)
		.eq("owner_id", req.user.id)
		.single();
	if (fetchError) throw new ApiError(500, "failed to create download Url");
	const Url = await createSupabaseDownloadUrl(file.storage_path);

	res.status(200).json({ message: `Here is the Url : ${Url.signedUrl}` });
});
export {
	fileUpload,
	getFiles,
	renameFile,
	deleteFile,
	restoreFile,
	permanentDeleteFile,
	createDownloadUrl,
};
