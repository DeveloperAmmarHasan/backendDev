import { asyncHandler } from "../utils/asyncHandler.js";

const shareFile = asyncHandler(async (req, res) => {
	const { role } = req.body || "viewer";
	const share_token = randomBytes(16).toString("hex");

	const { data, error } = await supabase
		.from("shared_files")
		.insert([
			{
				file_id: req.params.fileId,
				owner_id: req.userId,
				role,
				share_token,
			},
		])
		.select("*")
		.single();

	if (error) return res.status(500).json({ error: error.message });

	res.json({ link: `${process.env.APP_URL}/shared/${share_token}` });
});

const accessSharedFile = asyncHandler(async (req, res) => {
	const { data: shared, error: sharedErr } = await supabase
		.from("shared_files")
		.select("file_id, role, files(*)")
		.eq("share_token", req.params.token)
		.single();

	if (sharedErr) return res.status(404).json({ error: "Link not found" });

	// Generate signed URL from Supabase Storage
	const { data: urlData, error: urlErr } = await supabase.storage
		.from("files")
		.createSignedUrl(shared.files.storage_path, 60 * 60); // 1 hour

	if (urlErr) return res.status(500).json({ error: urlErr.message });

	res.json({ role: shared.role, url: urlData.signedUrl });
});

const revokeShare = asyncHandler(async (req, res) => {
	const { error } = await supabase
		.from("shared_files")
		.delete()
		.eq("file_id", req.params.fileId)
		.eq("owner_id", req.userId);

	if (error) return res.status(500).json({ error: error.message });

	res.json({ message: "Share revoked" });
});
