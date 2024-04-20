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
    username: Joi.string().max(30).alphanum().lowercase().required().label("Tên đăng nhập"),
    password: passwordComplexity(_complexityOptions).required().label("Mật khẩu"),
    email: Joi.string().email().max(50).lowercase().required().label('Email'),
    phone: _phoneValidation.required().label("Số điện thoại"),
    birthday: Joi.date().allow('', null).label("Ngày sinh"),
    sex: Joi.string().max(10).allow('', null).label("Giới tính"),
    fullname: Joi.string().required().max(100).label("Họ và tên"),
    address: Joi.string().pattern(/^[^`'"!+%$^&*()]+$/).max(100).allow('', null).label('Địa chỉ'),
}).messages(errorJoiMessages);

export const resendEmail = Joi.object({
    email: Joi.string().email().max(50).lowercase().required().label('Email'),
}).options({ allowUnknown: true }).messages(errorJoiMessages);

export const login = Joi.object({
    username: Joi.string().max(50).lowercase().label("Tên đăng nhập"),
    password: passwordComplexity(_complexityOptions).required().label("Mật khẩu"),
}).messages(errorJoiMessages);

export const newPassword = Joi.object({
    password: passwordComplexity(_complexityOptions).required().label("Mật khẩu"),
}).messages(errorJoiMessages);

export const changePassword = Joi.object({
    oldPassword: Joi.string().min(8).max(20).required().label("Mật khẩu cũ"),
    newPassword: passwordComplexity(_complexityOptions).required().label("Mật khẩu mới"),
}).messages(errorJoiMessages);

export const changeUserData = Joi.object({
    phone: _phoneValidation.label("Số điện thoại"),
    birthday: Joi.date().label("Ngày sinh"),
    email: Joi.string().email().max(50).lowercase().label('Email'),
    sex: Joi.string().max(10).label("Giới tính"),
    fullname: Joi.string().max(100).label("Họ và tên"),
    avatar: Joi.string().max(100).label("Avatar"),
    address: Joi.string().pattern(/^[^`'"!+%$^&*()]+$/).max(100).label('Địa chỉ'),
}).messages(errorJoiMessages);