import multer from "multer";

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const uploadImage = upload