import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

export const uploadImage = (image, folder) => {
    console.log(image, folder)
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({folder: folder,}, (error, result) => {
            console.log(error)
            console.log(result)
            if (error) return reject(error);
            return resolve(result.url);
        })
        streamifier.createReadStream(image).pipe(stream);
    })
}