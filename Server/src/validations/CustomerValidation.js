import Joi from 'joi';
import { errorJoiMessages } from '../utils/index.js'

const _phoneValidation = Joi.string()
    .pattern(/((09|03|07|08|05)+([0-9]{8})\b)/)
    .min(6)
    .max(15)
    .label("Số điện thoại")
    .messages({ 'string.pattern.name': 'Số điện thoại không hợp lệ!' });

export const create = Joi.object({
    firstname: Joi.string().max(50).label("Họ"),
    lastname: Joi.string().max(50).required().label("Tên"),
    fullname: Joi.string().max(50).required().label("Họ và tên"),
    phone: _phoneValidation.required().label("Số điện thoại"),
    email: Joi.string().email().max(50).lowercase().label('Email'),
    id_number: Joi.string().max(15).label('Số căn cước công dân'),
    birthday: Joi.date().label("Ngày sinh"),
    sex: Joi.string().max(10).label("Giới tính"),
    address: Joi.string().pattern(/^[^`'"!+%$^&*()]+$/).max(100).label('Địa chỉ'),
    apartment: Joi.string().required().label("Nhà trọ"),
}).messages(errorJoiMessages);

export const update = Joi.object({
    firstname: Joi.string().max(50).label("Họ"),
    lastname: Joi.string().max(50).label("Tên"),
    fullname: Joi.string().max(50).label("Họ và tên"),
    phone: _phoneValidation.label("Số điện thoại"),
    email: Joi.string().email().max(50).lowercase().label('Email'),
    id_number: Joi.string().max(15).label('Số căn cước công dân'),
    birthday: Joi.date().label("Ngày sinh"),
    sex: Joi.string().max(10).label("Giới tính"),
    address: Joi.string().pattern(/^[^`'"!+%$^&*()]+$/).max(100).label('Địa chỉ'),
}).messages(errorJoiMessages);