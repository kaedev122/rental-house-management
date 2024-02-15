import nodemailer from 'nodemailer'

export const sendMail = (emailTo, activeCode) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    })
    console.log(emailTo)
    const options = {
        from: process.env.EMAIL, // địa chỉ admin email bạn dùng để gửi
        to: emailTo, // địa chỉ gửi đến
        subject: "Chào mừng bạn đến với Rental Minder - Phần mềm quản lý nhà cho thuê", // Tiêu đề của mail
        text: `Vui lòng xác minh địa chỉ email của bạn. Link: http://localhost:3000/auth/active/${activeCode}` // Phần nội dung mail mình sẽ dùng html thay vì thuần văn bản thông thường.
    }

  // hàm transporter.sendMail() này sẽ trả về cho chúng ta một Promise
    return transporter.sendMail(options)
}