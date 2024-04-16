import mongoose from 'mongoose';
import { User, Apartment, } from "../models/index.js"
import * as ApartmentValidation from '../validations/ApartmentValidation.js'
import * as Utils from "../utils/index.js"
import moment from 'moment';
import { ParamError, ExistDataError, NotFoundError, AuthenticationError, SystemError, PermissionError } from "../utils/errors.js";
import Promise from "bluebird"
import { getPagination, getPagingData } from "../utils/paging.js"
import { uploadImage } from "../utils/UploadService.js"

const _validateOtherPrice = (otherPrice) => {
    // validate quote [{content: string, price: number, type: TYPE_QUOTE}]
    if (!otherPrice || !Array.isArray(otherPrice)) throw new ParamError('Dữ liệu chi phí khác không đúng định dạng')
    let newOtherPrice = []
    for (let i = 0; i < otherPrice.length; i++) {
        const item = otherPrice[i];
        let name = item.name || ''
        let price = parseInt(item.price) || 0
        if ( !name ) throw new ParamError('Dữ liệu chi phí khác không đúng định dạng: Tên chi phí')
        if ( !price ) throw new ParamError('Dữ liệu chi phí khác không đúng định dạng: Giá chi phí')

        newOtherPrice.push({
            ...item,
        })
    }
    return { newOtherPrice }
}

export const create = async ({body, user, files}) => {
    let validate = await ApartmentValidation.create.validateAsync(body)
    validate.user = user.id
    validate.name_search = Utils.convertVietnameseString(validate.name)
    let apartmentExist = await Apartment.findOne({
        status: 1,
        name_search: validate.name_search,
        user: validate.user
    }).lean()

    if (apartmentExist) throw new ExistDataError(`Tên nhà trọ đã tồn tại!`)

    if (validate.other_price) {
        try {
            validate.other_price = JSON.parse(validate.other_price)
        } catch (error) {
            throw new ParamError('Dữ liệu chi phí khác không đúng định dạng')
        }
        const { newOtherPrice } = _validateOtherPrice(validate.other_price)
        validate.other_price = newOtherPrice
    }

    if (validate.location) {
        try {
            validate.location = JSON.parse(validate.location)
        } catch (error) {
            throw new ParamError('Dữ liệu báo giá không đúng')
        }
    }
    
    if (!validate.phone) {
        let userPhone = await User.findById(validate.user).select("phone").lean()
        validate.phone = userPhone.phone
    }

    if (files && files.length > 0) {
        let images = []
        if (files.length > 6) throw new ExistDataError("Chỉ được tối đa 6 ảnh!")
        await Promise.map(files, async (file) => {
            let result = await uploadImage(file.buffer, "apartment", user.id)
            images.push(result)
        })
        validate.images = images
    }

    const newApartment = {
        ...validate,
    }
    const result = await Apartment.create(newApartment)
    return result
}

export const update = async ({body, params, user, files}) => {
    const { id } = params    
    if (!id) throw new ParamError("Thiếu id")
    let validate = await ApartmentValidation.update.validateAsync(body)
    if (validate.bank_id || validate.account_number || validate.account_name) {
        if (!validate.bank_id || !validate.account_number || !validate.account_name) throw new ParamError('Thiếu thông tin ngân hàng')
        validate.bank_info = {
            bank_id: validate.bank_id,
            account_number: validate.account_number,
            account_name: validate.account_name.toUpperCase()
        }
    }

    validate.user = user.id
    let oldApartment = await Apartment.findById(id).lean()
    if (!oldApartment) throw new NotFoundError(`Không tìm thấy nhà trọ!`)
    
    if (validate.name) {
        validate.name_search = Utils.convertVietnameseString(validate.name)
        let apartmentExist = await Apartment.findOne({
            _id: { $ne: id },
            status: 1,
            name_search: validate.name_search,
            user: validate.user
        }).lean()
        if (apartmentExist) throw new ExistDataError(`Tên nhà trọ đã tồn tại!`)
    }

    if (validate.location) {
        try {
            validate.location = JSON.parse(validate.location)
        } catch (error) {
            throw new ParamError('Dữ liệu báo giá không đúng')
        }
    }
    if (validate.other_price) {
        try {
            validate.other_price = JSON.parse(validate.other_price)
        } catch (error) {
            throw new ParamError('Dữ liệu báo giá không đúng')
        }
        const { newOtherPrice } = _validateOtherPrice(validate.other_price)
        validate.other_price = newOtherPrice
    }

    let images = []

    if (validate.images) {
        images = validate.images.split(",")
    }

    if (files && files.length > 0) {
        if (files.length > 6) throw new ExistDataError("Chỉ được tối đa 6 ảnh!")
        await Promise.map(files, async (file) => {
            let result = await uploadImage(file.buffer, "apartment", user.id)
            images.push(result)
        })
    }

    if (images.length > 0) {
        validate.images = images
    }

    let result = await Apartment.findByIdAndUpdate(id, { ...validate }, {new: true})
    return result
}

export const list = async ({ 
    query: { 
        q = "",
        status,
        sort
    }, 
    user 
}) => {
    let conditions = {}
    if (q && !Utils.checkSearch(q)) {
        conditions["$or"] = [
            {
                name_search: {
                    $regex: ".*" + Utils.convertVietnameseString(q) + ".*",
                }
            }
        ]
    }

    if (user) conditions.user = user.id
    if (status) conditions.status = status

    const [totalItems, data] = await Promise.all([
        Apartment.countDocuments(conditions),
        Apartment.find(conditions)
            .select("-user -name_search -updatedAt -__v")
            .sort({ createdAt: -1 })
            .lean()
    ])

    let result = data
    if (sort === 'true') result = result.reverse()

    return { total: totalItems , items: result }
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new ParamError('Thiếu id')

    const data = await Apartment.findById(id)
        .select("-name_search -updatedAt -__v")
        .populate("user", "fullname email phone")
        .populate("bank_info.bank_id", "-updatedAt -__v -createdAt")
        .lean()
    if (!data) throw new NotFoundError('Không tìm thấy nhà trọ')
    return {
        ...data,
        bank_info: {
            short_name: data.bank_info ? data.bank_info.bank_id.short_name : "",
            name: data.bank_info ? data.bank_info.bank_id.name : "",
            bin: data.bank_info ? data.bank_info.bank_id.bin : "",
            logo: data.bank_info ? data.bank_info.bank_id.logo : "",
        },
        bank_id: data.bank_info ? data.bank_info.bank_id._id : "",
        account_number: data.bank_info ? data.bank_info.account_number : "",
        account_name: data.bank_info ? data.bank_info.account_name : "",
        images: data.images ? data.images.filter(item => item) : []
    }
}

export const remove = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    const oldApartment = await Apartment.findById(id)
    if (!oldApartment) throw new NotFoundError("Không tìm thấy nhà trọ")
    await Apartment.findByIdAndUpdate(id, { status: 0 })
    return true
}
