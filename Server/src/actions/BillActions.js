import mongoose from 'mongoose';
import { User, RoomGroup, Room, Customer, Contract, Bill, Paid } from "../models/index.js"
import * as BillValidation from '../validations/BillValidation.js'
import * as Utils from "../utils/index.js"
import moment from 'moment';
import { ParamError, ExistDataError, NotFoundError, AuthenticationError, SystemError, PermissionError } from "../utils/errors.js";
import Promise from "bluebird"
import { getPagination, getPagingData } from "../utils/paging.js"
import { PAYMENT_STATUS } from '../utils/constant.js';

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
        room: validate.room,
        status: 1
    }).sort({ createdAt: -1 }).limit(1);

    let lastWaterNumber, lastElectricNumber = 0
    if (lastBill) {
        lastWaterNumber = lastBill?.water_number
        lastElectricNumber = lastBill?.electric_number
    } else {
        lastWaterNumber = contractExist?.start_water_number
        lastElectricNumber = contractExist?.start_electric_number
    }

    validate.water_used = validate?.water_number - lastWaterNumber
    validate.electric_used = validate?.electric_number - lastElectricNumber

    validate.water_total = validate.water_used * contractExist?.water_price
    validate.electric_total = validate.electric_used * contractExist?.electric_price

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
    
    validate.total_price = validate?.water_total + validate?.electric_total + (validate?.total_other_price || 0) 
            + validate?.room_price + (validate?.cost_incurred || 0)
    validate.total = validate.total_price - (validate?.discount || 0)
    validate.debt = validate.total
    validate.code = await _newBillCode(validate.apartment)
    const newBill = {
        ...validate,
    }
    const result = await Bill.create(newBill)
    if (result) {
        await Contract.findByIdAndUpdate(validate.contract, {
            last_export_bill: new Date(),
            bill_status: 1
        })
    }

    return result
}

export const update = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    const validate = await BillValidation.update.validateAsync(body)

    let oldBill = await Bill.findById(id).lean()
    if (!oldBill) throw new NotFoundError(`Không tìm thấy hóa đơn!`)

    if (validate.water_number || validate.electric_number || validate.discount || validate.cost_incurred) {
        validate.water_used = validate?.water_number - oldBill.last_water_number
        validate.electric_used = validate?.electric_number - oldBill.last_electric_number
    
        validate.water_total = validate.water_used * oldBill.water_price
        validate.electric_total = validate.electric_used * oldBill.electric_price
    }

    validate.total_price = validate?.water_total + validate?.electric_total + (oldBill?.total_other_price || 0) 
            + oldBill?.room_price + (validate?.cost_incurred || oldBill.cost_incurred)
    validate.total = validate.total_price - (validate?.discount || oldBill.discount)
    
    validate.debt = validate.total - (oldBill.paid + (validate.paid || 0))
    if (validate.debt <= 0) {
        validate.debt = 0
        validate.payment_status = PAYMENT_STATUS.PAID
    } else if (oldBill.paid + (validate.paid || 0) > 0) {
        validate.payment_status = PAYMENT_STATUS.PAY_PART
    } else {
        validate.payment_status = PAYMENT_STATUS.NOT_PAY
    }

    let result = await Bill.findByIdAndUpdate(id, { ...validate }, {new: true})
    return result
}

export const payBill = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    const validate = await BillValidation.pay.validateAsync(body)

    let oldBill = await Bill.findById(id).lean()
    if (!oldBill) throw new NotFoundError(`Không tìm thấy hóa đơn!`)

    if (oldBill.payment_status == PAYMENT_STATUS.NOT_PAY) {
        if (oldBill.debt == 0) {
            validate.paid = validate.money
            validate.payment_status = PAYMENT_STATUS.PAID
        } else {
            validate.paid = validate.money
            if (validate.money > oldBill.debt) {
                validate.paid = oldBill.debt
            }
        }
    } else {
        if (oldBill.payment_status == PAYMENT_STATUS.PAY_PART) {
            // Số tiền thanh toán > số tiền còn nợ và phiếu đã thanh toán hoặc thanh toán 1 phần => update số tiền thanh toán = nợ cũ
            if (validate.money > oldBill.debt) {
                validate.paid = oldBill.debt
            } else {
                // phiếu đã thanh toán 1 phần => update số tiền thanh toán = số tiền vừa nhập + số tiền cũ
                validate.paid = validate.money + oldBill.paid
            }
        }
    }

    // cập nhật lại số nợ và trạng thái thanh toán
    if (validate.payment_status != PAYMENT_STATUS.PAID) {
        validate.debt = oldBill.total - (validate.money + oldBill.paid)
        if (validate.debt <= 0) {
            validate.debt = 0
            validate.payment_status = PAYMENT_STATUS.PAID
            validate.paid = oldBill.total
            validate.money = validate.paid - oldBill.paid
        } else {
            validate.payment_status = PAYMENT_STATUS.PAY_PART
        }
    }

    await Bill.findByIdAndUpdate(id, {
        ...validate
    })

    let result = await Paid.create({
        money: validate.money,
        bill: oldBill._id,
        contract: oldBill.contract,
        apartment: oldBill.apartment
    })

    return result
}

export const list = async ({ 
    query: {
        status = 1,
        apartment,
        page = 1,
        limit = 10,
        payment_status,
        contract,
        q
    }, 
    user 
}) => {
    let conditions = {}

    if (q && !Utils.checkSearch(q)) {
        let code = Utils.convertCode(q, "DTT")
        conditions["$or"] = [
            {
                code: {
                    $regex: ".*" + code + ".*",
                }
            }
        ]
    }

    if (!apartment) throw new ParamError("Thiếu id nhà trọ")
    conditions.apartment = apartment
    if (status) conditions.status = status
    if (contract) conditions.contract = contract
    if (payment_status) conditions.payment_status = payment_status
    let { offset } = getPagination(page, limit)

    const [totalItems, data] = await Promise.all([
        Bill.countDocuments(conditions),
        Bill.find(conditions)
            .select("-apartment -updatedAt -__v")
            .populate('room', 'name')
            .populate('contract', 'code')
            .sort({ createdAt: -1 })            
            .limit(limit)
            .skip(offset)
            .lean()
    ])

    const result = data.map(item => {
        return {
            ...item,
            code: Utils.padNumber('DTT', item.code),
            contract: {
                _id: item?.contract._id,
                code: Utils.padNumber('HD', item?.contract?.code),
            }
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

    return {
        ...data,
    }
}

export const closeBill = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new ParamError("Thiếu id")
    let oldBill = await Bill.findById(id).lean()
    if (!oldBill) throw new NotFoundError(`Không tìm thấy hóa đơn!`)
    if (oldBill.status == 0) throw new PermissionError("Hóa đơn đã đóng!")
    await Bill.findByIdAndUpdate(id, { status: 0 })
    return true
}