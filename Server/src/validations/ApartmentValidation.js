import Joi from 'joi';
import { errorJoiMessages } from '../utils/index.js'

const _phoneValidation = Joi.string()
    .pattern(/((09|03|07|08|05)+([0-9]{8})\b)/)
    .min(6)
    .max(15)
    .label("Số điện thoại")
    .messages({ 'string.pattern.name': 'Số điện thoại không hợp lệ!' });

export const create = Joi.object({
    name: Joi.string().max(50).pattern(/[a-zA-Z0-9\s]/).required().label("Tên nhà trọ"),
    phone: _phoneValidation.label("Số điện thoại"),
    address: Joi.string().pattern(/^[^`'"!+%$^&*()]+$/).required().max(100).label('Địa chỉ'),
    location: Joi.string().label('Vị trí'),
    water_price: Joi.number().label("Giá tiền một số nước"),
    electric_price: Joi.number().label("Giá tiền một số điện"),
    other_price: Joi.string().label('Chi phí khác'),
}).messages(errorJoiMessages);

export const update = Joi.object({
    name: Joi.string().max(50).pattern(/[a-zA-Z0-9\s]/).label("Tên nhà trọ"),
    phone: _phoneValidation.label("Số điện thoại"),
    address: Joi.string().pattern(/^[^`'"!+%$^&*()]+$/).max(100).label('Địa chỉ'),
    location: Joi.string().label('Vị trí'),
    water_price: Joi.number().label("Giá tiền một số nước"),
    electric_price: Joi.number().label("Giá tiền một số điện"),
    other_price: Joi.string().label('Chi phí khác'),
}).messages(errorJoiMessages);