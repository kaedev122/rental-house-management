import mongoose from 'mongoose';
import { User, RoomGroup, Room, Service, Contract } from "../models/index.js"
import * as ServiceValidation from '../validations/ServiceValidation.js'
import * as Utils from "../utils/index.js"
import moment from 'moment';
import { ParamError, ExistDataError, NotFoundError, AuthenticationError, SystemError, PermissionError } from "../utils/errors.js";
import Promise from "bluebird"
import { getPagination, getPagingData } from "../utils/paging.js"

export const create = async ({ body, user }) => {
    let validate = await ServiceValidation.create.validateAsync(body)
    validate.name_search = Utils.convertVietnameseString(validate.name)

    let nameExist = await Service.findOne({
        name: validate.name,
        status: 1,
        apartment: validate.apartment
    }).lean()
    if (nameExist) throw new ExistDataError(`Tên dịch vụ này đã tồn tại!`)

    const newService = {
        ...validate,
    }
    const result = await Service.create(newService)
    return result
}

export const update = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    const validate = await ServiceValidation.update.validateAsync(body)

    let oldService = await Service.findById(id).lean()
    if (!oldService) throw new NotFoundError(`Không tìm thấy dịch vụ!`)

    if (validate.name) {
        validate.name_search = Utils.convertVietnameseString(validate.name)
        let nameExist = await Service.findOne({
            _id: {$ne: oldService._id},
            name: validate.name,
            status: 1,
            apartment: oldService.apartment
        }).lean()
        if (nameExist) throw new ExistDataError(`Tên dịch vụ này đã tồn tại!`)
    }

    let result = await Service.findByIdAndUpdate(id, { ...validate }, {new: true})
    return result
}

export const list = async ({ 
    query: { 
        q = "",
        status,
        apartment,
        sort,
    }, 
    user 
}) => {
    let conditions = {}

    if (q && !Utils.checkSearch(q)) {
        let phone = ''
        if (Utils.validatePhoneNumber(q.replace(' ', ''))) {
            phone = q
        } 
        conditions["$or"] = [
            {
                name_search: {
                    $regex: ".*" + Utils.convertVietnameseString(q) + ".*",
                }
            },
        ]
        if (phone) conditions["$or"].push(
            {
                phone: {
                    $regex: ".*" + phone + ".*",
                }
            })
    }

    conditions.apartment = apartment
    if (status) conditions.status = status

    const [totalItems, data] = await Promise.all([
        Service.countDocuments(conditions),
        Service.find(conditions)
            .select("-status -updatedAt -__v")
            .sort({ createdAt: -1 })
            .lean()
    ])

    let result = data
    if (sort === 'true') result = result.reverse()

    return { total: totalItems , items: result }
}

export const get = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError('Thiếu id')

    const data = await Service.findById(id)
        .select("-name_search -status -updatedAt -__v")
        .lean()
    if (!data) throw new NotFoundError('Không tìm thấy dịch vụ')

    return {
        ...data,
    }
}

export const remove = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    const oldService = await Service.findById(id)
    if (!oldService) throw new NotFoundError("Không tìm thấy dịch vụ")
    await Service.findByIdAndUpdate(id, { status: 0 })
    return true
}