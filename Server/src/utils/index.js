import { ErrorCodes } from './constant.js';

export const handleRequest = handler => async (req, res, next) => {
    if (typeof handler !== "function")
        throw new Error("Handler must be a function")
    try {
        let data = await handler({
            body: req.body,
            params: req.params,
            query: req.query,
            user: req.user,
            files: req.files,
            file: req.file,
        })
        console.log(data)
        res.json({ code: ErrorCodes.SUCCESS, data: data })
    } catch (error) {
        next(error)
    }
}

export const convertVietnameseString = (str) => {
    str = str.toLowerCase();
    // Replace special characters with non-accented equivalents
    str = str.replace(/[àáảãạăằắẳẵặâầấẩẫậ]/g, 'a');
    str = str.replace(/[đ]/g, 'd');
    str = str.replace(/[èéẻẽẹêềếểễệ]/g, 'e');
    str = str.replace(/[ìíỉĩị]/g, 'i');
    str = str.replace(/[òóỏõọôồốổỗộơờớởỡợố]/g, 'o');
    str = str.replace(/[ùúủũụưừứửữự]/g, 'u');
    str = str.replace(/[ỳýỷỹỵ]/g, 'y');
    
    // Replace multiple spaces with a single space
    str = str.replace(/\s+/g, ' ');
    // Replace spaces with underscores
    str = str.replace(/ /g, '_');
    return str;
}

export const errorJoiMessages = {
    'string.base': '{#label} phải là chuỗi kí tự',
    'string.alphanum': '{#label} chỉ chứa kí tự chữ và số',
    'string.min': '{#label} ít nhất {#limit} kí tự',
    'string.max': '{#label} tối đa {#limit} kí tự',
    'any.required': '{#label} là bắt buộc',
    'string.pattern.base': '{#label} không đúng định dạng',
    'string.regex.base': '{#label} không đúng định dạng',
    'string.email': '{#label} không đúng định dạng',
    'number.base': '{#label} phải là số',
    'number.min': '{#label} phải lớn hơn hoặc bằng {#limit}',
    'number.max': '{#label} phải nhỏ hơn hoặc bằng {#limit}',
    'number.positive': '{#label} phải lớn hơn 0',
    'date.base': '{#label} phải là ngày tháng',
    'date.format': '{#label} không đúng định dạng ngày tháng',
};

export const generateRandomString = () => {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export const checkSearch = (q) => {
    const regex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
    return regex.test(q);
}

export const validatePhoneNumber = (input) => {
    let isnum = /^\d+$/.test(input);
    return isnum
}