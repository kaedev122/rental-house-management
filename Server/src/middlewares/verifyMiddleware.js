import jwt from 'jsonwebtoken';
import { ParamError, ExistDataError, NotFoundError, AuthenticationError, SystemError, PermissionError } from "../utils/errors.js";

export const verify = (rolesCheck=[]) => {
    return async (req, res, next) => {
    console.log(rolesCheck)
    const { authorization } = req.headers
        if (!authorization) {
            return next(new AuthenticationError(`Bạn chưa đăng nhập!`))
        }
        const accessToken = authorization.replace("Bearer ", "")
        try {
            const payload = await new Promise((resolve, reject) => {
                jwt.verify(accessToken, process.env.JWT_KEY, (error, payload) => {
                    if (error) return reject(error)
                    return resolve(payload)
                })
            })
            let { id, username, role } = payload
            if (!id || !username) return next(new AuthenticationError(`Dữ liệu không đúng!`))
            req["user"] = { ...payload }
            if (rolesCheck.length > 0) {
                let isAllow = false
                for (let i = 0; i < rolesCheck.length; i++) {
                    if (role.includes(rolesCheck[i])) {
                        isAllow = true
                        break
                    }
                }
                if (!isAllow) return next(new AuthenticationError(`Bạn không có quyền truy cập!`))
            }
        } catch (error) {
            return next(new AuthenticationError(`Bạn chưa đăng nhập!`))
        }
        next()
    }
}

export const verifyRecovery = () => {
    return async (req, res, next) => {
        const { authorization } = req.headers
        if (!authorization) {
            return next(new AuthenticationError(`Bạn không có quyền!`))
        }
        const accessToken = authorization.replace("Bearer ", "")
        try {
            const payload = await new Promise((resolve, reject) => {
                jwt.verify(accessToken, process.env.JWT_KEY, (error, payload) => {
                    if (error) return reject(error)
                    return resolve(payload)
                })
            })
            let { id, recovery } = payload
            if (!id) return next(new AuthenticationError(`Bạn không có quyền!`))
            if (!recovery) return next(new AuthenticationError(`Bạn không có quyền!`))
            req["user"] = { ...payload }
        } catch (error) {
            return next(new AuthenticationError(`Bạn không có quyền!`))
        }
        next()
    }
}
