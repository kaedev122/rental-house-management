import nodemailer from 'nodemailer'

export const sendMailActive = (emailTo, activeCode) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    })
    const options = {
        from: process.env.EMAIL, // địa chỉ admin email bạn dùng để gửi
        to: emailTo, // địa chỉ gửi đến
        subject: "Chào mừng bạn đến với Rental Minder - Phần mềm quản lý nhà cho thuê", // Tiêu đề của mail
        text: `Vui lòng xác minh địa chỉ email của bạn. Link: http://localhost:5173/active-user/${activeCode}` // Phần nội dung mail mình sẽ dùng html thay vì thuần văn bản thông thường.
    }

  // hàm transporter.sendMail() này sẽ trả về cho chúng ta một Promise
    return transporter.sendMail(options)
}

export const sendMailRecovery = (emailTo, recoveryCode) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    })
    const options = {
        from: process.env.EMAIL, // địa chỉ admin email bạn dùng để gửi
        to: emailTo, // địa chỉ gửi đến
        subject: "Lấy lại mật khẩu Rental Minder - Phần mềm quản lý nhà cho thuê", // Tiêu đề của mail
        text: `Đây là mã code dùng để lấy lại mật khẩu cho tài khoản của bạn, vui lòng không cung cấp cho người lạ. Mã code: ${recoveryCode}` // Phần nội dung mail mình sẽ dùng html thay vì thuần văn bản thông thường.
    }

  // hàm transporter.sendMail() này sẽ trả về cho chúng ta một Promise
    return transporter.sendMail(options)
}