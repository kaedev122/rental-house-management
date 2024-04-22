import mongoose from 'mongoose';
import { User, ActiveCode, RecoveryCode, Apartment } from "../models/index.js"
import * as UserValidation from '../validations/UserValidation.js'
import * as Utils from "../utils/index.js"
import { sendMailActive, sendMailRecovery } from "../utils/mailer.js"
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { ParamError, ExistDataError, NotFoundError, AuthenticationError, SystemError, PermissionError } from "../utils/errors.js";
import { generateRandomString } from "../utils/index.js"
import { uploadImage } from "../utils/UploadService.js"
import { getPagination, getPagingData } from "../utils/paging.js"

export const list = async ({ 
    query: { 
        q = "",
        status,
        limit = 10,
        page = 1,
        createdTo = "",
        createdFrom = ""
    }, 
    user
}) => {
    let conditions = {
        role: { $ne: "admin" }
    }

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
            },{
                username: {
                    $regex: ".*" + q + ".*",
                }
            },{
                email: {
                    $regex: ".*" + q + ".*",
                }
            }
        ]
        if (phone) conditions["$or"].push(
            {
                phone: {
                    $regex: ".*" + phone + ".*",
                }
            })
    }

    if (status) conditions.status = status
    let { offset } = getPagination(page, limit)

    let createdAt = {}
    if (createdFrom) createdAt['$gte'] = Utils.convertToStartTime(createdFrom)
    if (createdTo) createdAt['$lte'] = Utils.convertToEndTime(createdTo)
    if (Object.keys(createdAt).length > 0) conditions.createdAt = createdAt

    const [totalItems, data] = await Promise.all([
        User.countDocuments(conditions),
        User.find(conditions)
            .select("-updatedAt -__v")
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean()
    ])

    let result = data

    return { total: totalItems , items: result }
}

export const get = async ({ query: { id } }) => {
    if (!id) throw new ParamError("Thiếu id")
    const data = await User.findById(id).select("-password -updatedAt -__v").lean()
    if (!data) throw new NotFoundError("Không tìm thấy dữ liệu")
    return data
}

export const update = async ({ body, user, params }) => {
    const { id } = params
    const { status } = body
    if (!id) throw new ParamError("Thiếu id")
    await User.findByIdAndUpdate(id, {
        status: status
    })
    return true
}
