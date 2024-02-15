import mongoose from 'mongoose';
import { User, ActiveCode } from "../models/index.js"
import * as UserValidation from '../validations/UserValidation.js'
import * as Utils from "../utils/index.js"
import { sendMail } from "../utils/mailer.js"
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { ParamError, ExistDataError, NotFoundError, AuthenticationError, SystemError, PermissionError, GaraExpriredError } from "../utils/errors.js";

export const create = async ({body, file}) => {
    const newUser = await UserValidation.create.validateAsync(body)

    let usernameExist = await User.findOne({ username: newUser.username })
    if (usernameExist != null) throw new ExistDataError(`Tên tài khoản đã tồn tại!`);

    let emailExist = await User.findOne({ email: newUser.email }).lean()
    if (emailExist != null) throw new ExistDataError(`Email đã tồn tại!`);

    let phoneExist = await User.findOne({ phone: newUser.phone }).lean()
    if (phoneExist != null) throw new ExistDataError(`Số điện thoại đã tồn tại!`);

    newUser.username = newUser.username.toLowerCase();
    newUser.name_search = Utils.convertVietnameseString(newUser.fullname)
    if (newUser.birthday) newUser.birthday = new Date(newUser.birthday)

    let plainPassword = newUser.password;
    newUser.password = bcrypt.hashSync(plainPassword, 12)
    
    const result = await User.create(newUser);

    const randomString = crypto.randomBytes(32).toString('hex');

    await ActiveCode.create({
        user_id: result._id,
        active_code: randomString
    })

    await sendMail(newUser.email, randomString)
    return true
}

export const active = async ({body, user, params}) => {
    const { code } = params
    const result = await ActiveCode.findOne({active_code: code})
    if (!result) throw new ExistDataError(`Không tìm thấy tài khoản để kích hoạt`);

    await User.findByIdAndUpdate(result.user_id, {
        status: 1
    })
    await ActiveCode.findByIdAndDelete(result._id)
    return true
}