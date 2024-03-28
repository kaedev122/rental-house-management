import mongoose from 'mongoose';
import { User, RoomGroup, Room, Customer, Contract, Bill } from "../models/index.js"
import * as ContractValidation from '../validations/ContractValidation.js'
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

const _newContractCode = async (apartment) => {
    const numberOrder = await Contract.countDocuments({ apartment })
    return numberOrder + 1
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
    if (roomExist.contract) {
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
    validate.code = await _newContractCode(validate.apartment)

    const newContract = {
        ...validate,
        bill_status: 2,
        last_export_bill: new Date(),
    }
    const result = await Contract.create(newContract)
    if (result) {
        await Promise.all([
            Customer.updateMany({ 
                _id: { $in: result.customers } 
            },{ 
                $set: { status: 2 }
            }),
            Room.findByIdAndUpdate(validate.room, {
                contract: result._id,
                room_price: validate.room_price,
                customer_represent: validate.customer_represent,
                water_price: validate.water_price,
                electric_price: validate.electric_price,
            }).lean()
        ])
    }

    return result
}

export const update = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    const validate = await ContractValidation.update.validateAsync(body)
    let oldContract = await Contract.findById(id).lean()
    if (!oldContract) throw new NotFoundError(`Không tìm hợp đồng!`)
    if (validate.customers) {
        try {
            validate.customers = JSON.parse(validate.customers)
        } catch (error) {
            throw new ParamError('Dữ liệu khách hàng không đúng định dạng')
        }
        const { newCustomers } = _validateCustomers(validate?.customers)
        validate.customers = newCustomers
    }

    if (validate.room || validate.customer_represent) {
        let roomExist = await Room.findById(validate.room).lean()
        if ((roomExist?.contract || "").toString() != oldContract._id.toString()) {
            let contractExist = await Contract.findOne({
                _id: { $ne: oldContract._id },
                room: validate.room,
                status: 1
            }).lean()
            if (contractExist) throw new ExistDataError(`Phòng đã có hợp đồng tồn tại!`)
            await Room.findByIdAndUpdate(validate.room, {
                contract: oldContract._id,
                room_price: validate.room_price || oldContract.room_price,
                customer_represent: validate.customer_represent || oldContract.customer_represent,
                water_price: validate.water_price || oldContract.water_price,
                electric_price: validate.electric_price || oldContract.electric_price,
            })
            await Room.findByIdAndUpdate(oldContract.room, {
                contract: null,
                customer_represent: null,
            })
        } else {
            await Room.findByIdAndUpdate(validate.room, {
                customer_represent: validate.customer_represent || oldContract.customer_represent,
            })
        }
    }

    if (validate.other_price) {
        try {
            validate.other_price = JSON.parse(validate.other_price)
        } catch (error) {
            throw new ParamError('Dữ liệu chi phí khác không đúng định dạng')
        }
        const { newOtherPrice, totalOtherPrice } = _validateOtherPrice(validate.other_price)
        validate.other_price = newOtherPrice
        validate.total_other_price = totalOtherPrice
        if (validate.customers.length <= 0) throw new PermissionError("Không được phép xóa hết khách trong hợp đồng!")
    }
    let result = await Contract.findByIdAndUpdate(id, { ...validate }, {new: true})
    if (validate.customers) {
        await Customer.updateMany({
            $and: [
                { _id: { $in: oldContract.customers } },
                { _id: { $nin: result.customers } }
            ]
        },{
            $set: { status: 1 }
        })
        await Customer.updateMany({
            $and: [
                { _id: { $nin: oldContract.customers } },
                { _id: { $in: result.customers } }
            ]
        },{
            $set: { status: 2 }
        })
    }

    return result
}

export const endContract = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    let oldContract = await Contract.findById(id).lean()
    if (!oldContract) throw new NotFoundError(`Không tìm hợp đồng!`)
    if (oldContract.status == 0) throw new PermissionError("Hợp đồng đã đóng")

    await Promise.all([
        Contract.findByIdAndUpdate(id, { status: 0 }, {new: true}),
        Customer.updateMany({
            _id: { $in: oldContract.customers },
        },{
            $set: { status: 1 }
        }),
        Room.findByIdAndUpdate(oldContract.room, {
            contract: null,
            customer_represent: null,
        })
    ])

    return true
}

export const list = async ({ 
    query: {
        status = 1,
        apartment,
        page = 1,
        limit = 10,
    }, 
    user 
}) => {
    let conditions = {}

    if (!apartment) throw new ParamError("Thiếu id nhà trọ")
    conditions.apartment = apartment
    if (status) conditions.status = status
    let { offset } = getPagination(page, limit)

    const [totalItems, data] = await Promise.all([
        Contract.countDocuments(conditions),
        Contract.find(conditions)
            .select("-apartment -updatedAt -__v")
            .populate('room', 'name')
            .populate('customer_represent', 'fullname phone')
            .sort({ createdAt: -1 })            
            .limit(limit)
            .skip(offset)
            .lean()
    ])

    const result = data.map(item => {
        return {
            ...item,
            code: Utils.padNumber('HD', item.code),
        }
    })
    return getPagingData(result, totalItems, page, limit)
}

export const get = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError('Thiếu id')

    const data = await Contract.findById(id)
        .select("-apartment -updatedAt -__v")
        .populate('room', 'name')
        .populate('customer_represent', 'fullname phone')
        .populate('customers', '-__v -status -avatar -apartment -lastname -firstname -name_search -updatedAt')
        .lean()
    if (!data) throw new NotFoundError('Không tìm thấy hợp đồng')
    const lastBill = await Bill.findOne({
        status: 1,
        contract: id,
    }).select("electric_number water_number").sort({ createdAt: -1 }).limit(1);

    return {
        ...data,
        lastBill
    }
}