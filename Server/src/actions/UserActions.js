import mongoose from 'mongoose';
import { User, ActiveCode, RecoveryCode } from "../models/index.js"
import * as UserValidation from '../validations/UserValidation.js'
import * as Utils from "../utils/index.js"
import { sendMailActive, sendMailRecovery } from "../utils/mailer.js"
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { ParamError, ExistDataError, NotFoundError, AuthenticationError, SystemError, PermissionError } from "../utils/errors.js";
import { generateRandomString } from "../utils/index.js"
import { time } from 'console';

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

    await sendMailActive(newUser.email, randomString)
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

export const resendEmail = async ({body}) => {
    const validate = await UserValidation.resendEmail.validateAsync(body)
    const email = validate.email
    const user = await User.findOne({email: email})
    if (!user) throw new NotFoundError(`Không tìm thấy tài khoản có email: ${email}`);
    if (user.status == 1) throw new ExistDataError(`Tài khoản có email: ${email} đã được kích hoạt`);
    const activeCode = await ActiveCode.findOne({user_id: user._id})
    let randomString = activeCode.active_code
    if (!randomString) {
        randomString = crypto.randomBytes(32).toString('hex');
        await ActiveCode.create({
            user_id: user._id,
            active_code: randomString
        })
    }
    await sendMailActive(email, randomString)
}

export const login = async ({body}) => {
    const validate = await UserValidation.login.validateAsync(body)
    let { username, password } = validate

    if (!username) throw new AuthenticationError(`Vui lòng nhập tên đăng nhập hoặc email`)

    const conditions = {}
    conditions["$or"] = [
        {
            username: username
        },
        {
            email: username
        },
    ]

    let user = await User.findOne({ $or: [{ username: username }, { email: username }] }).lean()
    if (!user) throw new ParamError("Không tìm thấy tài khoản!")
    if (user.status == 0) throw new AuthenticationError("Vui lòng kích hoạt tài khoản")

    if (await bcrypt.compare(password, user.password)) {
        const payload = {
            id: user._id.toString(),
            username: user.username,
        }
        let token = jwt.sign(
            payload,
            process.env.JWT_KEY,
            {
                expiresIn: "365d"
            }
        )
        return {
            ...payload,
            access_token: token
        }
    } else {
        throw new ParamError("Sai tài khoản hoặc mật khẩu không đúng!")
    }
}

export const sendEmailRecoveryPassword = async ({body}) => {
    const validate = await UserValidation.resendEmail.validateAsync(body)
    let user = await User.findOne({email: validate.email}).lean()
    if (!user) throw new NotFoundError(`Không tìm thấy tài khoản với địa chỉ email: ${validate.email}`)

    let result = await RecoveryCode.findOne({user_id: user._id}).lean()
    const currentTime = new Date();
    if (result) {
        const timeDiff = (currentTime - result.createdAt)/1000
        if (timeDiff > 120) {
            await RecoveryCode.findByIdAndDelete(result._id)
        } else {
            throw new ExistDataError(`Đã gửi mã xác nhận đến email: ${validate.email}`)
        }
    }

    let recoveryCode = generateRandomString()
    await RecoveryCode.create({
        user_id: user._id,
        recovery_code: recoveryCode
    })

    await sendMailRecovery(user.email, recoveryCode);
    return true
}

export const recoveryPassword = async ({body}) => {
    const validate = await UserValidation.resendEmail.validateAsync(body)
    const {recoveryCode} = body
    const currentTime = new Date();
    let user = await User.findOne({email: validate.email}).lean()
    if (!user) throw new NotFoundError(`Không tìm thấy tài khoản với địa chỉ email: ${validate.email}`)
    let result = await RecoveryCode.findOne({user_id: user._id}).lean()
    if (result) {
        const timeDiff = (currentTime - result.createdAt)/1000
        if (timeDiff > 120) {
            await RecoveryCode.findByIdAndDelete(result._id)
            throw new AuthenticationError("Mã xác nhận đã hết hạn")
        } else {
            if (recoveryCode == result.recovery_code) {
                await RecoveryCode.findByIdAndDelete(result._id)
                const payload = {
                    id: user._id.toString(),
                    recovery: true
                }
                let token = jwt.sign(
                    payload,
                    process.env.JWT_KEY,
                    {
                        expiresIn: "1h"
                    }
                )
                return {
                    ...payload,
                    recovery_token: token
                }
            } else {
                throw new NotFoundError(`Mã xác nhận không hợp lệ`)
            }
        }
    } else {
        throw new NotFoundError(`Mã xác nhận không hợp lệ`)
    }
}

export const newPassword = async ({body, user}) => {
    const validate = await UserValidation.newPassword.validateAsync(body)
    let plainPassword = validate.password;
    validate.password = bcrypt.hashSync(plainPassword, 12)
    const result = await User.findByIdAndUpdate(user.id, {
        password: validate.password
    })
    if (!result) throw new NotFoundError(`Không tìm thấy tài khoản`)
    return true
}

export const ping = () => {
    return "pong"
}