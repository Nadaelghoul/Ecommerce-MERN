import DataUriParser from "datauri/parser.js";
import path from "path";

//This function is used to convert an uploaded file from Multer into a Data URI, so you can send it directly to Cloudinary.
const bufferGenerator = (file) => {
    const parser = new DataUriParser()

    const extName = path.extname(file.originalname).toString(); //Get the file extension

    return parser.format(extName, file.buffer);
};


export default bufferGenerator;