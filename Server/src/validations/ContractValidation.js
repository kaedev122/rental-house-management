import Joi from 'joi';
import { errorJoiMessages } from '../utils/index.js'

const _phoneValidation = Joi.string()
    .pattern(/((09|03|07|08|05)+([0-9]{8})\b)/)
    .min(6)
    .max(15)
    .label("Số điện thoại")
    .messages({ 'string.pattern.name': 'Số điện thoại không hợp lệ!' });

export const create = Joi.object({
    note: Joi.string().max(200).label("Tên nhà trọ"),
    date_start: Joi.date().required().label("Ngày bắt đầu hợp đồng"),
    date_end: Joi.date().required().label("Ngày kết thúc hợp đồng"),
    deposit_money: Joi.number().label("Tiền cọc"),
    water_price: Joi.number().label("Giá tiền một số nước"),
    electric_price: Joi.number().label("Giá tiền một số điện"),
    room_price: Joi.number().label("Giá phòng"),
    other_price: Joi.string().label("Chi phí khác"),
    customer_represent: Joi.string().required().label("Người đại diện"),
    customers: Joi.string().required().label("Khách hàng"),
    room: Joi.string().label("Phòng trọ"),
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