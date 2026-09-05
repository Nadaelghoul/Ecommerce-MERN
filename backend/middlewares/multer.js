import multer from "multer";

// a Multer middleware for uploading multiple files, and keeps those files in memory instead of saving them to your server.

const storage = multer.memoryStorage();

const uploadFiles = multer({storage}).array("files", 10); //Accept multiple files from a form field called "files", with a maximum of 10 files.

export default uploadFiles;