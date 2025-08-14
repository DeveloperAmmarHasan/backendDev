import { supabase } from "../../supabase.config.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createFolder = asyncHandler(async (req, res) => {
	const { folderName, parent_id } = req.body;

	const { data, error } = await supabase
		.from("folders")
		.insert([
			{ folderName, owner_id: req.user.id, parent_id: parent_id || null },
		])
		.select("*")
		.single();

	if (error) throw new ApiError(500, `can't create folder ${error.message}`);
	res.json(new ApiResponse(200, `${data}`, "folder has been created"));
});

const renameFolder = asyncHandler(async (req, res) => {
	const { folderName } = req.body;
	const { data, error } = await supabase
		.from("folders")
		.update({ folderName })
		.eq("id", req.params.id)
		.eq("owner_id", req.user.id)
		.select("*")
		.single();

	if (error) throw new ApiError(400, "can't rename folder", error.message);

	res.json(new ApiResponse(200, data, "folder renamed successfully"));
});

const deleteFolder = asyncHandler(async (req, res) => {
	const { data, error } = await supabase
		.from("folders")
		.update({ is_deleted: true })
		.eq("id", req.params.id)
		.eq("owner_id", req.userId)
		.select("*")
		.single();

	if (error) throw new ApiError(400, "can't delete the folder", error.message);

	res.json(new ApiResponse(200, data, "folder deleted successfully"));
});

const listFilesFolders = asyncHandler(async (req, res) => {
	const { parent_id } = req.query;

	const { data: folders, error: folderError } = await supabase
		.from("folders")
		.select("*")
		.eq("owner_id", req.user.id)
		.eq("parent_id", parent_id || null)
		.eq("is_deleted", false);

	if (folderError) throw new ApiError(400, "can't fetch folders ", folderError);

	const { data: files, error: filesError } = await supabase
		.from("files")
		.select("*")
		.eq("owner_id", req.user.id)
		.eq("folder_id", parent_id || null)
		.eq("is_deleted", false);
	if (filesError) throw new ApiError(400, "can't fetch files ", folderError);
	res.json({ folders, files });
});

export { createFolder, renameFolder, deleteFolder, listFilesFolders };
