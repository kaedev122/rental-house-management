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
    date_start: Joi.date().required().label("Ngày bắt đầu hợp đồng"),
    date_end: Joi.date().required().label("Ngày kết thúc hợp đồng"),
    deposit_money: Joi.number().label("Tiền cọc"),
    start_water_number: Joi.number().min(0).required().label("Số nước đầu vào"),
    start_electric_number: Joi.number().min(0).required().label("Số điện đầu vào"),
    water_price: Joi.number().label("Giá tiền một số nước"),
    electric_price: Joi.number().label("Giá tiền một số điện"),
    room_price: Joi.number().label("Giá phòng"),
    other_price: Joi.string().label("Chi phí khác"),
    days_per_check: Joi.number().label("Số ngày kiểm tra"),
    customer_represent: Joi.string().required().label("Người đại diện"),
    customers: Joi.string().required().label("Khách hàng"),
    room: Joi.string().required().label("Phòng trọ"),
    apartment: Joi.string().required().label("Nhà trọ"),
}).messages(errorJoiMessages);

export const update = Joi.object({
    room: Joi.string().label("Phòng trọ"),
    note: Joi.string().max(200).label("Ghi chú"),
    date_start: Joi.date().label("Ngày bắt đầu hợp đồng"),
    date_end: Joi.date().label("Ngày kết thúc hợp đồng"),    
    start_water_number: Joi.number().min(0).label("Số nước đầu vào"),
    start_electric_number: Joi.number().min(0).label("Số điện đầu vào"),
    deposit_money: Joi.number().label("Tiền cọc"),
    water_price: Joi.number().label("Giá tiền một số nước"),
    electric_price: Joi.number().label("Giá tiền một số điện"),
    days_per_check: Joi.number().label("Số ngày kiểm tra"),
    room_price: Joi.number().label("Giá phòng"),
    other_price: Joi.string().label("Chi phí khác"),
    customer_represent: Joi.string().label("Người đại diện"),
    customers: Joi.string().label("Khách hàng"),
}).messages(errorJoiMessages);