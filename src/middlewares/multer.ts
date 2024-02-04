import multer from "multer";
import { v4 as uuid } from "uuid";

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		console.log("reaching here");
		callback(null, "uploads"); //folder to store our files inside
	},
	filename: (req, file, callback) => {
		console.log("photo: ", file);

		const id = uuid();
		const file_extension = file.originalname.split(".").pop(); //getting the part after the last "."

		const fileName = id + "." + file_extension;
		callback(null, fileName);
	},
});

export const singleUpload = multer({ storage }).single("photo"); //has to be the same name as we provide in the frontend form,here:"photo"
