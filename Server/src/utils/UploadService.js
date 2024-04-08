import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

export const uploadImage = (image, folder, id) => {
    return new Promise((resolve, reject) => {
        const uniqueFilename = id + '-' + Date.now();
        const stream = cloudinary.uploader.upload_stream({folder: folder, public_id: uniqueFilename}, (error, result) => {
            if (error) return reject(error);
            return resolve(result.url);
        })
        streamifier.createReadStream(image).pipe(stream);
    })
}