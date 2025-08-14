import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
	path: "./.env",
});

app.listen(process.env.PORT || 3000, () => {
	console.log(`server is running at http://localhost:${process.env.PORT}`);
});
/*
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello - Google drive Supabase is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`server is running at http://localhost:${PORT}`);
});
 */
