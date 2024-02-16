import React, { Fragment, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Button, Form, FormGroup, Label, Input, InputGroup, InputGroupText, Card, CardBody, CardHeader, CardFooter, Row, Col } from 'reactstrap'
import { trim, set_authenticated_storage, http_request, get_local_storage, is_authenticated, set_local_storage, is_empty } from '@utils'
import "@styles/style.scss";
import "./register.scss";
import { FaTriangleExclamation } from "react-icons/fa6";

const Register = () => {
	const location = useLocation();

	const [dataAdd, setDataAdd] = useState({
		username: "",
		password: "",
        repassword: "",
        email: "",
        phone: "",
        birthday: "",
        sex: "",
        firstname: "",
        lastname: "",
        address: "",
	});
	const [errorForm, setErrorForm] = useState({})

    const onSubmit = async () => {
		if (is_empty(dataAdd.lastname)) {
			return setErrorForm({
				"lastname": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (is_empty(dataAdd.username)) {
			return setErrorForm({
				"username": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (is_empty(dataAdd.email)) {
			return setErrorForm({
				"email": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (is_empty(dataAdd.phone)) {
			return setErrorForm({
				"phone": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
		if (is_empty(dataAdd.password)) {
			return setErrorForm({
				"password": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (is_empty(dataAdd.repassword)) {
			return setErrorForm({
				"repassword": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (dataAdd.password != dataAdd.repassword) {
            setDataAdd({
                ...dataAdd,
                repassword: ""
            })
            return setErrorForm({
				"repassword": {
					"error": true,
					"message": "Các mật khẩu đã nhập không khớp. Hãy thử lại."
				}
			})
        }
        const input = {
			"username": trim(dataAdd.username),
			"password": trim(dataAdd.password)
		}
		const res = await http_request({ method: "POST", url: "auth/login", data: input, path: location.pathname })
		const { code, data, message } = res
        if (is_empty(res)) {
			return dispatch(show_notification({
				"type": "danger",
				"message": "Hệ thống đang nâng cấp! Chờ cập nhật",
			}))
		}
        if (code === 200) {
			set_authenticated_storage(data)
			return get_data_store(data.department)
		} else {
			return setErrorForm({
				"password": {
					"error": true,
					"message": "Thông tin đăng nhập chưa chính xác!"
				}
			})
		}
    }

	const onChangeData = (type, value) => {
        setErrorForm({})
		return setDataAdd({
			...dataAdd,
			[type]: value
		})
	}

	if (is_authenticated()) {
		return <div>
			<Navigate to="/home"/>
		</div>
	}

    const goToForgotPassword = () => {
        return <div>
			<Navigate to="/password-recovery"/>
        </div>
    }

    const goToRegister = () => {
        return <div>
			<Navigate to="/register"/>
        </div>
    }

    return (
        <div className='form'>
            <div>LOGO</div>
            <Card 
                className="my-2"
            >
                <CardHeader>
                    <label className='d-flex justify-content-center'>Đăng ký tài khoản ???</label>
                </CardHeader>
                    <FormGroup className=''>
                    <div className='d-flex justify-content-between'> 
                        <Input
                            id="firstname"
                            name="firstname"
                            placeholder="Họ"
                            type="firstname"
                            onChange={(e) =>
                                onChangeData("firstname", e.target.value)
                            }
                        />
                    <InputGroup>
                        <Input
                            className="ms-2"
                            id="lastname"
                            name="lastname"
                            placeholder="Tên"
                            type="lastname"
                            onChange={(e) =>
                                onChangeData("lastname", e.target.value)
                            }
                            />
                        <InputGroupText>
                            {dataAdd.lastname ? "" : <FaTriangleExclamation/>}
                        </InputGroupText>
                    </InputGroup>
                    </div>
                    {errorForm.lastname?.error && <div className='text-error text-end'>{errorForm.lastname?.message}</div>}
                    </FormGroup>

                    <FormGroup>
                        <InputGroup>
                        <Input
                            id="Username"
                            name="username"
                            placeholder="Tên tài khoản"
                            type="username"
                            onChange={(e) =>
                                onChangeData("username", e.target.value)
                            }
                        />
                        <InputGroupText>
                        {dataAdd.username ? "" : <FaTriangleExclamation/>}
                    </InputGroupText>
                    </InputGroup>
                        {errorForm.username?.error && <div className='text-error'>{errorForm.username?.message}</div>}
                    </FormGroup>

                    <FormGroup>
                        <InputGroup>
                        <Input
                            id="Email"
                            name="Email"
                            placeholder="Email"
                            type="Email"
                            onChange={(e) =>
                                onChangeData("email", e.target.value)
                            }
                        />
                        <InputGroupText>
                        {dataAdd.email ? "" : <FaTriangleExclamation/>}
                    </InputGroupText>
                    </InputGroup>
                    {errorForm.email?.error && <div className='text-error'>{errorForm.email?.message}</div>}
                    </FormGroup>

                    <FormGroup>
                        <InputGroup>
                        <Input
                            id="Phone"
                            name="phone"
                            placeholder="Số điện thoại"
                            type="phone"
                            onChange={(e) =>
                                onChangeData("phone", e.target.value)
                            }
                        />
                        <InputGroupText>
                        {dataAdd.phone ? "" : <FaTriangleExclamation/>}
                    </InputGroupText>
                    </InputGroup>
                        {errorForm.phone?.error && <div className='text-error'>{errorForm.phone?.message}</div>}
                    </FormGroup>

                    <FormGroup>
                        <InputGroup>
                        <Input
                            id="Password"
                            name="password"
                            placeholder="Mật khẩu"
                            type="password"
                            onChange={(e) =>
                                onChangeData("password", e.target.value)
                            }
                        />
                        <InputGroupText>
                        {dataAdd.password ? "" : <FaTriangleExclamation/>}
                    </InputGroupText>
                    </InputGroup>
                        {errorForm.password?.error && <div className='text-error'>{errorForm.password?.message}</div>}
                    </FormGroup>

                    <FormGroup>
                        <InputGroup>
                        <Input
                            id="repassword"
                            name="repassword"
                            placeholder="Nhập lại mật khẩu"
                            type="password"
                            onChange={(e) =>
                                onChangeData("repassword", e.target.value)
                            }
                        />
                        <InputGroupText>
                        {dataAdd.repassword ? "" : <FaTriangleExclamation/>}
                    </InputGroupText>
                    </InputGroup>
                        {errorForm.repassword?.error && <div className='text-error'>{errorForm.repassword?.message}</div>}
                    </FormGroup>

                    <FormGroup>
                        <Input
                            id="address"
                            name="address"
                            placeholder="Địa chỉ"
                            type="address"
                            onChange={(e) =>
                                onChangeData("address", e.target.value)
                            }
                        />
                    </FormGroup>
                    <FormGroup>
                        <Input
                            id="birthday"
                            name="birthday"
                            placeholder="Ngày sinh"
                            type="birthday"
                            onChange={(e) =>
                                onChangeData("birthday", e.target.value)
                            }
                        />
                    </FormGroup>
                    <FormGroup>
                        <Input
                            id="sex"
                            name="sex"
                            placeholder="Giới tính"
                            type="sex"
                            onChange={(e) =>
                                onChangeData("sex", e.target.value)
                            }
                        />
                    </FormGroup>
                    <FormGroup>
                        <Button block color='primary'
                            onClick={onSubmit}
                        >
                            Đăng nhập
                        </Button>
                        <Button color="link" className='text-center w-100'>
                            Quên mật khẩu
                        </Button>
                    <div className='border'></div>
                    </FormGroup>
                <CardFooter>
                    <FormGroup>
                        <Button block outline={false}>
                            Đăng kí tài khoản mới
                        </Button>
                    </FormGroup>
                </CardFooter>
            </Card>
        </div>)
}

export default Register