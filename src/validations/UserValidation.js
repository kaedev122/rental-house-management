import Joi from 'joi';
import passwordComplexity from "joi-password-complexity";
import { errorJoiMessages } from '../utils/index.js'

export const _complexityOptions = {
    min: 8,
    max: 20,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    // requirementCount: 4,
};

const _phoneValidation = Joi.string()
    .pattern(/((09|03|07|08|05)+([0-9]{8})\b)/)
    .min(6)
    .max(15)
    .label("Số điện thoại")
    .messages({ 'string.pattern.name': 'Số điện thoại không hợp lệ!' });

export const create = Joi.object({
    username: Joi.string().max(24).alphanum().required().label("Tên đăng nhập"),
    password: passwordComplexity(_complexityOptions).required().label("Mật khẩu"),
    email: Joi.string().email().required().label('Email'),
    phone: _phoneValidation.required().label("Số điện thoại"),
    birthday: Joi.date().label("Ngày sinh"),
    sex: Joi.string().max(10).label("Giới tính"),
    fullname: Joi.string().required().max(100).label("Họ và tên"),
    address: Joi.string().pattern(/^[^`'"!+%$^&*()]+$/).max(100).label('Địa chỉ'),
}).messages(errorJoiMessages);