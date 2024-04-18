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
        q,
        apartment,
        page = 1,
        limit = 10,
        contract,
        createdFrom = "",
        createdTo = "",
        bill
    },
    user
}) => {
    let conditions = {}
    let qConditions = {}

    if (q && !Utils.checkSearch(q)) {
        let billCode = Utils.convertCode(q, "DTT")
        let contractCode = Utils.convertCode(q, "HD")
        qConditions["$or"] = []
        if (billCode) qConditions["$or"].push({
            "bill.code": {
                $regex: ".*" + billCode + ".*",
            }
        })            
        if (contractCode) qConditions["$or"].push({  
            "contract.code": {
                $regex: ".*" + contractCode + ".*",
            }
        })
        if (qConditions["$or"].length == 0) qConditions["$or"].push({})
    }

    if (!apartment) throw new ParamError("Thiếu id nhà trọ")
    conditions.apartment = mongoose.Types.ObjectId(apartment)

    let { offset } = getPagination(page, limit)

    let createdAt = {}
    if (createdFrom) createdAt['$gte'] = Utils.convertToStartTime(createdFrom)
    if (createdTo) createdAt['$lte'] = Utils.convertToEndTime(createdTo)
    if (Object.keys(createdAt).length > 0) conditions.createdAt = createdAt

    // const [totalItems, data] = await Promise.all([
    //     Paid.countDocuments(conditions),
    //     Paid.find(conditions)
    //         .select("-apartment -updatedAt -__v")
    //         .populate('bill', '_id code')
    //         .populate('contract', '_id code')
    //         .sort({ createdAt: -1 })            
    //         .limit(limit)
    //         .skip(offset)
    //         .lean()
    // ])

    const data = await Paid.aggregate([
        { $match: conditions },
        { $project: { apartment: 0, updatedAt: 0, __v: 0 } },
        { 
            $lookup: {
                from: 'bills',
                localField: 'bill',
                foreignField: '_id',
                as: 'bill'
            }
        },
        { $unwind: '$bill' },
        { 
            $lookup: {
                from: 'contracts',
                localField: 'contract',
                foreignField: '_id',
                as: 'contract'
            }
        },
        { $unwind: '$contract' },
        { 
            $match: {
                ...qConditions
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: offset },
        { $limit: parseInt(limit) },
    ]);

    const totalItems = await Paid.aggregate([
        { $match: conditions },
        { $project: { apartment: 0, updatedAt: 0, __v: 0 } },
        { 
            $lookup: {
                from: 'bills',
                localField: 'bill',
                foreignField: '_id',
                as: 'bill'
            }
        },
        { $unwind: '$bill' },
        { 
            $lookup: {
                from: 'contracts',
                localField: 'contract',
                foreignField: '_id',
                as: 'contract'
            }
        },
        { $unwind: '$contract' },
        { 
            $match: {
                ...qConditions
            }
        },
        { $count: 'total'}
    ]);

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
    return getPagingData(result, totalItems[0]?.total || 0, page, limit)
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