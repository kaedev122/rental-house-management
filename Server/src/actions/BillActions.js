import mongoose from 'mongoose';
import { User, RoomGroup, Room, Customer, Contract, Bill } from "../models/index.js"
import * as BillValidation from '../validations/BillValidation.js'
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

const _newBillCode = async (apartment) => {
    const numberOrder = await Bill.countDocuments({ apartment })
    return numberOrder + 1
}

export const create = async ({ body, user }) => {
    let validate = await BillValidation.create.validateAsync(body)

    let contractExist = await Contract.findById(validate.contract).lean()
    if (contractExist.status == 0) throw new ParamError("Hợp đồng đã kết thúc!")

    const lastBill = await Bill.findOne({
        apartment: validate.apartment,
        contract: validate.contract,
        room: validate.room
    }).sort({ createdAt: -1 }).limit(1);

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
        last_export_bill: new Date()
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