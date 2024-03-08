import mongoose from 'mongoose';
import { User, RoomGroup, Room } from "../models/index.js"
import * as RoomValidation from '../validations/RoomValidation.js'
import * as Utils from "../utils/index.js"
import moment from 'moment';
import { ParamError, ExistDataError, NotFoundError, AuthenticationError, SystemError, PermissionError } from "../utils/errors.js";
import Promise from "bluebird"
import { getPagination, getPagingData } from "../utils/paging.js"

export const createRoomGroup = async ({ body, user }) => {
    let validate = await RoomValidation.createRoomGroup.validateAsync(body)
    validate.name_search = Utils.convertVietnameseString(validate.name)

    let groupExist = await RoomGroup.findOne({
        status: 1,
        name_search: validate.name_search,
        apartment: validate.apartment
    }).lean()
    if (groupExist) throw new ExistDataError(`Tên nhóm phòng đã tồn tại!`)

    const newRoomGroup = {
        ...validate,
    }
    const result = await RoomGroup.create(newRoomGroup)
    return result
}

export const updateRoomGroup = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    const validate = await RoomValidation.updateRoomGroup.validateAsync(body)

    let oldRoomGroup = await RoomGroup.findById(id).lean()
    if (!oldRoomGroup) throw new NotFoundError(`Không tìm thấy nhóm phòng trọ!`)

    if (validate.name) {
        validate.name_search = Utils.convertVietnameseString(validate.name)
        let groupExist = await RoomGroup.findOne({
            status: 1,
            name_search: validate.name_search,
            apartment: oldRoomGroup.apartment
        }).lean()
        if (groupExist) throw new ExistDataError(`Tên nhóm phòng đã tồn tại!`)
    }

    let result = await RoomGroup.findByIdAndUpdate(id, { ...validate }, {new: true})
    return result
}

export const listRoomGroup = async ({ 
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

    const [totalItems, data] = await Promise.all([
        RoomGroup.countDocuments(conditions),
        RoomGroup.find(conditions)
            .select("-apartment -name_search -status -updatedAt -__v")
            .sort({ createdAt: -1 })
            .lean()
    ])

    const result = data
    return { total: totalItems , items: result }
}

export const getRoomGroup = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError('Thiếu id')

    const data = await RoomGroup.findById(id)
        .select("-apartment -name_search -status -updatedAt -__v")
        .lean()
    if (!data) throw new NotFoundError('Không tìm thấy nhóm phòng trọ')

    return {
        ...data,
    }
}

export const removeRoomGroup = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    const oldRoomGroup = await RoomGroup.findById(id)
    if (!oldRoomGroup) throw new NotFoundError("Không tìm thấy nhóm phòng trọ")
    await RoomGroup.findByIdAndUpdate(id, { status: 0 })
    return true
}

export const create = async ({ body, user }) => {
    let validate = await RoomValidation.create.validateAsync(body)
    validate.name_search = Utils.convertVietnameseString(validate.name)

    let groupExist = await RoomGroup.findById(validate.group).lean()
    if (!groupExist) throw new ExistDataError(`Nhóm phòng không tồn tại!`)

    let roomExist = await Room.findOne({
        status: 1,
        name_search: validate.name_search,
        apartment: validate.apartment
    }).lean()
    if (roomExist) throw new ExistDataError(`Tên phòng đã tồn tại!`)

    const newRoom = {
        ...validate,
    }
    const result = await Room.create(newRoom)
    return result
}

export const update = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    const validate = await RoomValidation.update.validateAsync(body)

    let oldRoom = await Room.findById(id).lean()
    if (!oldRoom) throw new NotFoundError(`Không tìm thấy phòng trọ!`)

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
        apartment,
        sort,
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
            .lean(),
        Room.find(conditions)
            .select("-apartment -name_search -status -updatedAt -__v")
            .populate("contract", "-status -updatedAt -__v")
            .populate("customer_represent", "fullname phone")
            .lean()
    ])

    let result = dataGroup.map((item) => {
        const rooms = dataRoom.filter(room => room.group.toString() == item._id.toString())
        let totalRoom = rooms.length
        return {
            ...item,
            rooms,
            totalRoom
        }
    })
    if (sort === 'true') result = result.reverse()
    return { total: totalItems , items: result }
}