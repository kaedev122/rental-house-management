import Joi from 'joi';
import { errorJoiMessages } from '../utils/index.js'

export const create = Joi.object({
    name: Joi.string().max(100).required().label("Tên dịch vụ"),
    price: Joi.number().label('Giá dịch vụ'),
    apartment: Joi.string().required().label("Nhà trọ"),
}).messages(errorJoiMessages);

export const update = Joi.object({
    name: Joi.string().max(100).label("Tên dịch vụ"),
    price: Joi.number().label('Giá dịch vụ'),
}).messages(errorJoiMessages);