import React, { Fragment, useEffect, useState } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { Button, Form, FormGroup, Label, Input, Card, CardBody, CardHeader, CardFooter } from 'reactstrap'
import { trim, set_authenticated_storage, http_request, get_local_storage, is_authenticated, set_local_storage, is_empty } from '@utils'
import "@styles/style.scss";
import "./login.scss";

const Login = () => {
	const location = useLocation();
    const navigate = useNavigate();

	const [dataAdd, setDataAdd] = useState({
		username: "",
		password: ""
	});
	const [errorForm, setErrorForm] = useState({})

    const onSubmit = async () => {
		if (is_empty(dataAdd.username)) {
			return setErrorForm({
				"username": {
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
        const input = {
			"username": trim(dataAdd.username),
			"password": trim(dataAdd.password)
		}
		const res = await http_request({ method: "POST", url: "auth/login", data: input, path: location.pathname })
		const { code, data, message } = res
        if (is_empty(res)) {
			return dispatch(show_notification({
				"type": "danger",
				"message": "Hệ thống đang bảo trì!",
			}))
		}
        if (code === 200) {
			set_authenticated_storage(data)
            if (is_authenticated()) {
                return navigate("/home")
            } else {
                return navigate("/login")
            }
		} else {
			return setErrorForm({
				"password": {
					"error": true,
					"message": "Thông tin đăng nhập chưa chính xác!"
				}
			})
		}
    }

    useEffect(() => {
        if (is_authenticated()) {
            return navigate("/home")
        } 
    }, [])

	const onChangeData = (type, value) => {
        setErrorForm({})
		return setDataAdd({
			...dataAdd,
			[type]: value
		})
	}

    const goToForgotPassword = () => {
        return navigate("/forgot-password")
    }

    const goToRegister = () => {
        return navigate("/register")
    }

    return (
        <div className='form'>
            <div>LOGO</div>
            <Card 
                className="my-2"
            >
                <CardHeader>
                    <label className='d-flex justify-content-center'>Đăng nhập vào ???(chưa biết để tên app là gì)</label>
                </CardHeader>
                    <FormGroup>
                        <Input
                            id="Username"
                            name="username"
                            placeholder="Tài khoản hoặc email"
                            type="username"
                            onChange={(e) =>
                                onChangeData("username", e.target.value)
                            }
                        />
                        {errorForm.username?.error && <div className='text-error'>{errorForm.username?.message}</div>}
                    </FormGroup>
                    <FormGroup>
                        <Input
                            id="Password"
                            name="password"
                            placeholder="Mật khẩu"
                            type="password"
                            onChange={(e) =>
                                onChangeData("password", e.target.value)
                            }
                        />
                        {errorForm.password?.error && <div className='text-error'>{errorForm.password?.message}</div>}
                    </FormGroup>
                    <FormGroup>
                        <Button block color='primary'
                            onClick={onSubmit}
                        >
                            Đăng nhập
                        </Button>
                        <Button color="link" className='text-center w-100 btn-no-border' onClick={() => goToForgotPassword()}>
                            Quên mật khẩu
                        </Button>
                    <div className='border'></div>
                    </FormGroup>
                <CardFooter>
                    <FormGroup>
                        <Button block outline={false} onClick={() => goToRegister()}>
                            Đăng kí tài khoản mới
                        </Button>
                    </FormGroup>
                </CardFooter>
            </Card>
        </div>)
}

export default Login