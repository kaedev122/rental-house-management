import {ErrorCodes} from '../utils/constant.js';
import multer from 'multer';

const ErrorController = (err, req, res, next) => {

    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    let code = err.code || ErrorCodes.SYSTEM_ERROR
    let message = err.message

    // if(code == ErrorCodes.SYSTEM_ERROR) {
    //     logger.error(`${req.method} - ${code}:${message} - ${req.originalUrl} - ${req.ip} - ${(err.stack || err)}`)
    // }else{
    //     logger.error(`${req.method} - ${code}:${message} - ${req.originalUrl} - ${req.ip}`)
    // }

    // multer error handler    
    if (err instanceof multer.MulterError) {
        // Multer error occurred
        if (err.code === 'LIMIT_FILE_SIZE') {
            // Handle file size limit exceeded error
            message = 'File ảnh vượt quá kích thước cho phép'
            // return res.status(400).json({ code: code, message: 'File size exceeds the limit' });
        }
        // Handle other Multer errors
        code = 400
        message = 'Lỗi upload file'
    }

    res.status(err.status || 200).json({code: code, message: message})

}

export default ErrorController;