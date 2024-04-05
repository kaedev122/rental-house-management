import mongoose from 'mongoose';
import { User, RoomGroup, Room, Customer, Contract, Bill, Paid } from "../models/index.js"
import * as BillValidation from '../validations/BillValidation.js'
import * as Utils from "../utils/index.js"
import moment from "moment-timezone"
moment.tz.setDefault("Asia/Ho_Chi_Minh")
import { ParamError, ExistDataError, NotFoundError, AuthenticationError, SystemError, PermissionError } from "../utils/errors.js";
import Promise from "bluebird"
import { getPagination, getPagingData } from "../utils/paging.js"
import { PAYMENT_STATUS } from '../utils/constant.js';

export const getDebtReport = async ({ 
    query: { 
        group,
        apartment,
        dateFrom='',
        dateTo=''
    }, 
    user 
}) => {
    let conditions = {}
    if (apartment) conditions.apartment = mongoose.Types.ObjectId(apartment)
    if (group) conditions.group = mongoose.Types.ObjectId(group)

    let listRoom = await Room.find({
        ...conditions,
        status: 1
    }).lean()
    delete conditions.group
    let createdAt = {}
    if (dateFrom) createdAt['$gte'] = Utils.convertToStartTime(dateFrom)
    if (dateTo) createdAt['$lte'] = Utils.convertToEndTime(dateTo)
    if (Object.keys(createdAt).length > 0) conditions.createdAt = createdAt
    let debtAgg = [
        {
            $match: {
                ...conditions,
                room: { $in: listRoom.map(item => item._id) },
                status: 1
            }
        },{
            $group: {
                _id: "$room",
                total_debt: { $sum: "$debt" },
                total_paid: { $sum: "$paid" }
            }
        },{
            $lookup: {
                from: "rooms",
                localField: "_id",
                foreignField: "_id",
                as: "room"
            }
        },{
            $unwind: "$room",
        }
    ]

    let data = await Bill.aggregate(debtAgg)
    const result = listRoom.map((item) => {
        const bill = data.find(billData => billData._id.toString() == item._id.toString())
        return {
            room_id: item._id,
            total_debt: bill?.total_debt || 0,
            total_paid: bill?.total_paid || 0,
            name: `${item.name} (${((bill?.total_debt || 0) + (bill?.total_paid || 0)).toLocaleString()} đ)`,
            group: item.group,
        }
    })
    return result
}

export const getIncomeReport = async ({ 
    query: { 
        apartment,
        dateFrom='',
        dateTo='',
        year,
    }, 
    user 
}) => {
    let conditions = {}
    if (apartment) conditions.apartment = mongoose.Types.ObjectId(apartment)
    conditions.year = parseInt(moment().format("YYYY"))
    if (year) conditions.year = parseInt(year)
    console.log(conditions)
    let paidAgg = [
        {
            $match: {
                ...conditions
            }
        },
        {
            $group: {
                _id: "$month",
                total_money: { $sum: "$money" }
            }
        }
    ]

    const data = await Paid.aggregate(paidAgg)
    let result = []
    for (let i = 1; i < 13; i++) {
        let monthData = data.filter(item => {
            return item._id == i
        })
        if (monthData.length) {
            result.push({
                month: `Thg ${monthData[0]._id}`,
                totalMoney: monthData[0].total_money
            })
        } else {
            result.push({
                month: `Thg ${i}`,
                totalMoney: null
            })
        }
    }   
    
    return result
}