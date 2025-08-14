import multer from "multer";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public/temp-uploads");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${file.originalname}`;
		cb(null, `${file.fieldname}-${uniqueSuffix}`);
	},
	preservePath: true,
	mimeType: true,
});

export const upload = multer({ storage });
