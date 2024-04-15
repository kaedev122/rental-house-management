import Joi from 'joi';
import { errorJoiMessages } from '../utils/index.js'

export const createRoomGroup = Joi.object({
    name: Joi.string().max(50).pattern(/[a-zA-Z0-9\s]/).required().label("Tên nhóm phòng"),
    apartment: Joi.string().required().label("Nhà trọ"),
}).messages(errorJoiMessages);

export const updateRoomGroup = Joi.object({
    name: Joi.string().max(50).pattern(/[a-zA-Z0-9\s]/).label("Tên nhóm phòng"),
}).messages(errorJoiMessages);

export const create = Joi.object({
    name: Joi.string().max(50).pattern(/[a-zA-Z0-9\s]/).required().label("Tên phòng"),
    apartment: Joi.string().required().label("Nhà trọ"),
    group: Joi.string().required().label("Nhóm phòng trọ"),
    room_price: Joi.number().label("Giá phòng"),
    water_price: Joi.number().label("Giá nước"),
    electric_price: Joi.number().label("Giá điện"),
}).messages(errorJoiMessages);

export const update = Joi.object({
    name: Joi.string().max(50).pattern(/[a-zA-Z0-9\s]/).label("Tên phòng"),
    room_price: Joi.number().label("Giá phòng"),
    images: Joi.string().allow('').label('Hình ảnh'),
    water_price: Joi.number().label("Giá nước"),
    electric_price: Joi.number().label("Giá điện"),
    contract: Joi.number().label("Hợp đồng"),
}).messages(errorJoiMessages);
