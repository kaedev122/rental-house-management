import { ErrorCodes } from './constant.js';
import moment from "moment-timezone"
moment.tz.setDefault("Asia/Ho_Chi_Minh")

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
    
    // Replace all special characters with spaces
    str = str.replace(/[^a-zA-Z0-9 ]/g, ' ');

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
    "passwordComplexity.uppercase": "Mật khẩu phải có chứa chữ cái in hoa",
    "passwordComplexity.lowercase": "Mật khẩu phải có chứa chữ cái in thường",
    "passwordComplexity.numeric": "Mật khẩu phải có chứa chữ số",
    "passwordComplexity.tooShort": "Mật khẩu phải có ít nhất 8 kí tự",
    "passwordComplexity.tooLong": "Mật khẩu chỉ được nhiều nhất 20 kí tự",
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

export const padNumber = (prefix = 'HD', num) => {
    let paddedFill = '0000000';
    let length = 5;

    switch (prefix) {
        case 'HD':
            length = 5;
            paddedFill = '0000000';
            break;
        case 'DTT':
            length = 5;
            paddedFill = '0000000';
            break;
    }

    const paddedNum = paddedFill + num;
    return prefix + paddedNum.slice(-length);
}

export const convertCode = (q, keyword) => {
    q = q.toUpperCase();
    let code = '';
    const keywordIndex = q.toUpperCase().indexOf(keyword);
    if (typeof q === 'string' && keywordIndex > -1) {
        code = q.replace(keyword, "");
        if (code != '') code = +(code)
    } else {
        code = +(q);
        if (isNaN(code)) code = '';
    }

    return code;
}

export const convertToStartTime = (startTime) => {
    const startDate = moment(startTime)
    startDate.startOf('day');
    return startDate.toDate();
}

export const convertToEndTime = (stopTime) => {
    const stopDate = moment(stopTime)
    stopDate.endOf('day');
    return stopDate.toDate();
}