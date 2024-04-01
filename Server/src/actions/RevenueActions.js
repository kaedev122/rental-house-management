import mongoose from 'mongoose';
import { User, RoomGroup, Room, Customer, Contract, Bill, Paid } from "../models/index.js"
import * as BillValidation from '../validations/BillValidation.js'
import * as Utils from "../utils/index.js"
import moment from 'moment';
import { ParamError, ExistDataError, NotFoundError, AuthenticationError, SystemError, PermissionError } from "../utils/errors.js";
import Promise from "bluebird"
import { getPagination, getPagingData } from "../utils/paging.js"
import { PAYMENT_STATUS } from '../utils/constant.js';

export const list = async ({
    query: {
        apartment,
        page = 1,
        limit = 10,
        contract,
        bill
    },
    user
}) => {
    let conditions = {}
    if (!apartment) throw new ParamError("Thiếu id nhà trọ")
    conditions.apartment = apartment

    if (contract) conditions.contract = contract
    if (bill) conditions.bill = bill
    let { offset } = getPagination(page, limit)

    const [totalItems, data] = await Promise.all([
        Paid.countDocuments(conditions),
        Paid.find(conditions)
            .select("-apartment -updatedAt -__v")
            .populate('bill', '_id code')
            .populate('contract', '_id code')
            .sort({ createdAt: -1 })            
            .limit(limit)
            .skip(offset)
            .lean()
    ])

    const result = data.map(item => {
        return {
            ...item,
            contract: {
                _id: item?.contract._id,
                code: Utils.padNumber('HD', item?.contract?.code),
            },
            bill: {
                _id: item?.bill._id,
                code: Utils.padNumber('DTT', item?.bill?.code),
            }
        }
    })
    return getPagingData(result, totalItems, page, limit)
}

export const total = async ({
    query: {
        apartment,
        contract,
        bill
    },
    user
}) => {
    let conditions = {}
    if (!apartment) throw new ParamError("Thiếu id nhà trọ")
    conditions.apartment = mongoose.Types.ObjectId(apartment)

    if (contract) conditions.contract = mongoose.Types.ObjectId(contract)
    if (bill) conditions.bill = mongoose.Types.ObjectId(bill)
    const paidAgg = [
        {
            $match: {
                ...conditions,
            },
        },{
            $group: {
                _id: apartment,                
                total_money: { $sum: "$money" },
            }
        }
    ]

    const result = await Paid.aggregate(paidAgg)
    return {
        total_money: result[0].total_money,
        apartment: result[0]._id,
    }
}