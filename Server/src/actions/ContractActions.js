import mongoose from 'mongoose';
import { User, RoomGroup, Room, Customer, Contract } from "../models/index.js"
import * as ContractValidation from '../validations/ContractValidation.js'
import * as CustomerValidation from '../validations/CustomerValidation.js'
import * as Utils from "../utils/index.js"
import moment from 'moment';
import { ParamError, ExistDataError, NotFoundError, AuthenticationError, SystemError, PermissionError } from "../utils/errors.js";
import Promise from "bluebird"
import { getPagination, getPagingData } from "../utils/paging.js"

const _validateOtherPrice = (otherPrice) => {
    // validate quote [{content: string, price: number, type: TYPE_QUOTE}]
    if (!otherPrice || !Array.isArray(otherPrice)) throw new ParamError('Dữ liệu chi phí khác không đúng định dạng')
    let newOtherPrice = []
    let totalOtherPrice = 0
    for (let i = 0; i < otherPrice.length; i++) {
        const item = otherPrice[i];
        let name = item.name || ''
        let price = parseInt(item.price) || 0
        let number = parseInt(item.number) || 1
        if ( !name ) throw new ParamError('Dữ liệu chi phí khác không đúng định dạng: Tên chi phí')
        if ( !price ) throw new ParamError('Dữ liệu chi phí khác không đúng định dạng: Giá chi phí')
        if ( !number ) throw new ParamError('Dữ liệu chi phí khác không đúng định dạng: Số lượng')
        let total = price * number
        newOtherPrice.push({
            ...item,
            total
        })
        totalOtherPrice += total
    }
    return { newOtherPrice, totalOtherPrice }
}

const _validateCustomers = (customers) => {
    // validate quote [{content: string, price: number, type: TYPE_QUOTE}]
    if (!customers) throw new ParamError('Dữ liệu khách hàng không đúng định dạng')
    const newCustomers = []
    for (let i = 0; i < customers.length; i++) {
        const item = customers[i];
        if ( !item ) throw new ParamError('Dữ liệu khách hàng không đúng định dạng')
        newCustomers.push(item)
    }
    return { newCustomers }
}

export const create = async ({ body, user }) => {
    let validate = await ContractValidation.create.validateAsync(body)

    let roomExist = await Room.findById(validate.room).lean()
    if (roomExist?.contract) {
        let contractExist = await Contract.findOne({
            _id: roomExist.contract,
            status: 1
        }).lean()
        if (contractExist) throw new ExistDataError(`Phòng đã có hợp đồng tồn tại!`)
    }

    try {
        validate.customers = JSON.parse(validate.customers)
    } catch (error) {
        throw new ParamError('Dữ liệu khách hàng không đúng định dạng')
    }
    const { newCustomers } = _validateCustomers(validate?.customers)
    validate.customers = newCustomers

    if (validate.other_price) {
        try {
            validate.other_price = JSON.parse(validate.other_price)
        } catch (error) {
            throw new ParamError('Dữ liệu chi phí khác không đúng định dạng')
        }
        const { newOtherPrice, totalOtherPrice } = _validateOtherPrice(validate.other_price)
        validate.other_price = newOtherPrice
        validate.total_other_price = totalOtherPrice
    }

    const newContract = {
        ...validate,
    }
    const result = await Contract.create(newContract)

    await Room.findByIdAndUpdate(validate.room, {
        contract: result._id,
        room_price: validate.room_price,
        customer_represent: validate.customer_represent,
        water_price: validate.water_price,
        electric_price: validate.electric_price,
    }).lean()

    return result
}

export const update = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    const validate = await RoomValidation.update.validateAsync(body)

    let oldRoom = await Room.findById(id).lean()
    if (!oldRoom) throw new NotFoundError(`Không tìm phòng trọ!`)

    if (validate.name) {
        validate.name_search = Utils.convertVietnameseString(validate.name)
        let roomExist = await Room.findOne({
            status: 1,
            name_search: validate.name_search,
            apartment: oldRoom.apartment
        }).lean()
        if (roomExist) throw new ExistDataError(`Tên phòng đã tồn tại!`)
    }

    let result = await Room.findByIdAndUpdate(id, { ...validate }, {new: true})
    return result
}

export const list = async ({ 
    query: { 
        q = "",
        status,
        apartment,
        group
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

    if (!apartment) throw new ParamError("Thiếu id nhà trọ")
    conditions.apartment = apartment
    if (group) conditions.group = group
    if (status) conditions.status = status

    const [totalItems, data] = await Promise.all([
        Room.countDocuments(conditions),
        Room.find(conditions)
            .select("-apartment -name_search -status -updatedAt -__v")
            .sort({ createdAt: -1 })
            .lean()
    ])

    const result = data
    return { total: totalItems , items: result }
}

export const get = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError('Thiếu id')

    const data = await Room.findById(id)
        .select("-apartment -name_search -status -updatedAt -__v")
        .lean()
    if (!data) throw new NotFoundError('Không tìm thấy phòng trọ')

    return {
        ...data,
    }
}

export const remove = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    const oldRoom = await Room.findById(id)
    if (!oldRoom) throw new NotFoundError("Không tìm thấy nhóm phòng trọ")
    await Room.findByIdAndUpdate(id, { status: 0 })
    return true
}

export const listRoomGroupExtend = async ({ 
    query: { 
        q = "",
        status,
        apartment
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

    if (!apartment) throw new ParamError("Thiếu id nhà trọ")
    conditions.apartment = apartment
    if (status) conditions.status = status
    const [totalItems, dataGroup, dataRoom] = await Promise.all([
        RoomGroup.countDocuments(conditions),
        RoomGroup.find(conditions)
            .select("-apartment -name_search -status -updatedAt -__v")
            .sort({ createdAt: -1 })
            .lean(),
        Room.find(conditions)
            .select("-apartment -name_search -status -updatedAt -__v")
            .sort({ createdAt: -1 })
            .lean()
    ])

    const result = dataGroup.map((item) => {
        const rooms = dataRoom.filter(room => room.group.toString() == item._id.toString())
        let totalRoom = rooms.length
        return {
            ...item,
            rooms,
            totalRoom
        }
    })
    return { total: totalItems , items: result }
}