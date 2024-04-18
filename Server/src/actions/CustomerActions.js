import mongoose from 'mongoose';
import { User, RoomGroup, Room, Customer, Contract } from "../models/index.js"
import * as CustomerValidation from '../validations/CustomerValidation.js'
import * as Utils from "../utils/index.js"
import moment from 'moment';
import { ParamError, ExistDataError, NotFoundError, AuthenticationError, SystemError, PermissionError } from "../utils/errors.js";
import Promise from "bluebird"
import { getPagination, getPagingData } from "../utils/paging.js"
import { uploadImage } from "../utils/UploadService.js"

export const create = async ({ body, user }) => {
    let validate = await CustomerValidation.create.validateAsync(body)
    validate.name_search = Utils.convertVietnameseString(validate.fullname)

    // let phoneExist = await Customer.findOne({
    //     phone: validate.phone,
    //     status: {$ne: 0},
    //     apartment: validate.apartment
    // }).lean()
    // if (phoneExist) throw new ExistDataError(`Số điện thoại này đã tồn tại!`)

    if (validate.id_number) {
        let id_numberExist = await Customer.findOne({
            id_number: validate.id_number,
            status: {$ne: 0},
            apartment: validate.apartment
        }).lean()
        if (id_numberExist) throw new ExistDataError(`Số căn cước này đã tồn tại!`)
    }

    if (validate.email) {
        let emailExist = await Customer.findOne({
            email: validate.email,
            status: {$ne: 0},
            apartment: validate.apartment
        }).lean()
        if (emailExist) throw new ExistDataError(`Email này đã tồn tại!`)
    }

    const newCustomer = {
        ...validate,
    }
    const result = await Customer.create(newCustomer)
    return result
}

export const update = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    const validate = await CustomerValidation.update.validateAsync(body)

    let oldCustomer = await Customer.findById(id).lean()
    if (!oldCustomer) throw new NotFoundError(`Không tìm thấy khách hàng!`)

    if (validate.fullname) validate.name_search = Utils.convertVietnameseString(validate.fullname)

    // if (validate.phone) {
    //     let phoneExist = await Customer.findOne({
    //         _id: {$ne: id},
    //         phone: validate.phone,
    //         status: {$ne: 0},
    //         apartment: oldCustomer.apartment
    //     }).lean()
    //     if (phoneExist) throw new ExistDataError(`Số điện thoại này đã tồn tại!`)
    // }

    if (validate.id_number) {
        let id_numberExist = await Customer.findOne({
            _id: {$ne: id},
            id_number: validate.id_number,
            status: {$ne: 0},
            apartment: oldCustomer.apartment
        }).lean()
        if (id_numberExist) throw new ExistDataError(`Số căn cước này đã tồn tại!`)
    }

    if (validate.email) {
        let emailExist = await Customer.findOne({
            _id: {$ne: id},
            email: validate.email,
            status: {$ne: 0},
            apartment: oldCustomer.apartment
        }).lean()
        if (emailExist) throw new ExistDataError(`Email này đã tồn tại!`)
    }

    if ((validate.status == 0 || validate.status == 1) && oldCustomer.status == 2) {
        throw new PermissionError(`Không thể khóa khách đang thuê`)
    }

    let result = await Customer.findByIdAndUpdate(id, { ...validate }, {new: true})
    return result
}

export const list = async ({ 
    query: { 
        q = "",
        status,
        apartment,
        page = 1,
        limit = 10,
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

    let { offset } = getPagination(page, limit)

    const [totalItems, data] = await Promise.all([
        Customer.countDocuments(conditions),
        Customer.find(conditions)
            .select("-updatedAt -__v")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(offset)
            .lean()
    ])

    let result = data
    if (sort === 'true') result = result.reverse()

    return getPagingData(result, totalItems, page, limit)
}

export const listAdd = async ({ 
    query: { 
        q='',
        status,
        apartment,
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
    console.log(conditions)
    const [totalItems, data] = await Promise.all([
        Customer.countDocuments(conditions),
        Customer.find(conditions)
            .select("-status -updatedAt -__v")
            .sort({ createdAt: -1 })
            .lean()
    ])

    let result = data
    console.log(data)
    return {items: result, total: totalItems}
}

export const get = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError('Thiếu id')

    const data = await Customer.findById(id)
        .select("-name_search -updatedAt -__v")
        .lean()
    if (!data) throw new NotFoundError('Không tìm thấy khách hàng')

    return {
        ...data,
    }
}

export const remove = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    const oldCustomer = await Customer.findById(id)
    if (!oldCustomer) throw new NotFoundError("Không tìm thấy khách hàng")
    await Customer.findByIdAndUpdate(id, { status: 0 })
    return true
}