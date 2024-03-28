import Joi from 'joi';
import { errorJoiMessages } from '../utils/index.js'

const _phoneValidation = Joi.string()
    .pattern(/((09|03|07|08|05)+([0-9]{8})\b)/)
    .min(6)
    .max(15)
    .label("Số điện thoại")
    .messages({ 'string.pattern.name': 'Số điện thoại không hợp lệ!' });

export const create = Joi.object({
    note: Joi.string().max(200).label("Ghi chú"),
    water_number: Joi.number().label("Số nước"),
    electric_number: Joi.number().label("Số điện"),
    water_price: Joi.number().label("Giá tiền một số nước"),
    electric_price: Joi.number().label("Giá tiền một số điện"),
    room_price: Joi.number().label("Giá phòng"),
    other_price: Joi.string().label("Chi phí khác"),
    discount: Joi.number().label("Khuyến mãi"),
    cost_incurred: Joi.number().label("Chi phí phát sinh"),
    water_price: Joi.number().label("Giá tiền một số nước"),
    electric_price: Joi.number().label("Giá tiền một số điện"),
    last_water_number: Joi.number().label("Số nước kỳ trước"),
    last_electric_number: Joi.number().label("Số điện kỳ trước"),
    contract: Joi.string().required().label("Hợp đồng"),
    room: Joi.string().required().label("Phòng trọ"),
    apartment: Joi.string().required().label("Nhà trọ"),
}).messages(errorJoiMessages);

export const update = Joi.object({
    note: Joi.string().max(200).label("Ghi chú"),
    water_number: Joi.number().label("Số nước"),
    electric_number: Joi.number().label("Số điện"),
    discount: Joi.number().label("Khuyến mãi"),
    cost_incurred: Joi.number().label("Chi phí phát sinh"),
}).messages(errorJoiMessages);

export const pay = Joi.object({
    money: Joi.number().positive().label("Số tiền"),
}).messages(errorJoiMessages);