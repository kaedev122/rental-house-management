import React, { Fragment, useEffect, useState } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { Form, FormGroup, Label, Input, Card, CardBody, CardHeader, CardFooter } from 'reactstrap'
import { trim, set_authenticated_storage, http_request, get_local_storage, is_authenticated, set_local_storage, is_empty } from '@utils'
import { TextField, Button, } from '@mui/material';
import "@styles/style.scss";
import "./login.scss";
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { set_apartment_list, set_apartment_curent } from '@redux/apartmentSlice'

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    let usernameRef = React.createRef();
    let passwordRef = React.createRef();

	const [dataAdd, setDataAdd] = useState({
		username: "",
		password: ""
	});
	const [errorForm, setErrorForm] = useState({})
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const get_data_store = async () => {
		const input = {
            status: 1
		}
		const res = await http_request({method: "GET", url:"cms/apartments", params: input})
		const { code, data } = res
		if(code === 200 ){
			dispatch(set_apartment_list(data.items))
            set_local_storage("apartment", data.items[0]?._id)
            dispatch(set_apartment_curent(data.items[0]?._id))
		}
	}

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
            return enqueueSnackbar("Có lỗi đã xảy ra!", {
                variant: "error",
                autoHideDuration: 5000,
            })
		}
        if (code === 200) {
			set_authenticated_storage(data)
            if (is_authenticated()) {
                enqueueSnackbar("Đăng nhập thành công!", {
                    variant: "success",
                    autoHideDuration: 5000,
                })
                await get_data_store()
                return navigate("/cms/home")
            } else {
                return navigate("/login")
            }
		} else if (code === 401) {
            enqueueSnackbar(message, {
                variant: "error",
                autoHideDuration: 5000,
            })
            return 
        } else {
            enqueueSnackbar(message, {
                variant: "error",
                autoHideDuration: 5000,
            })
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
            return navigate("/cms/home")
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

    const pressEnterEvent = (event)=> {
        if (event.keyCode === 13) {
            switch (event.target.id) {
                case "username":
                    if (is_empty(dataAdd.username)) {
                        return setErrorForm({
                            "username": {
                                "error": true,
                                "message": "Không được để trống!"
                            }
                        })
                    } else {
                        passwordRef.current.focus();
                    }
                    break;
                case "password":
                    onSubmit()
                    break;
                default:
                    break;
            }
        }
    }

    return (
        <div className='form'>
            <div>LOGO</div>
            <Card 
                className="my-2"
            >
                <CardHeader>
                    <label className='d-flex justify-content-center'>Đăng nhập vào LodgingPro</label>
                </CardHeader>
                    <FormGroup>
                        <TextField
                            id="username"
                            name="username"
                            inputRef={usernameRef}
                            error={errorForm.username?.error}
                            label="Tài khoản hoặc email"
                            fullWidth={true}
                            type="username"
                            onChange={(e) =>
                                onChangeData("username", e.target.value)
                            }
                            onKeyUp={pressEnterEvent}
                        />
                        {errorForm.username?.error && <div className='text-error'>{errorForm.username?.message}</div>}
                    </FormGroup>
                    <FormGroup>
                        <TextField
                            id="password"
                            name="password"
                            inputRef={passwordRef}
                            error={errorForm.password?.error}
                            fullWidth={true}
                            label="Mật khẩu"
                            type="password"
                            onChange={(e) =>
                                onChangeData("password", e.target.value)
                            }
                            onKeyUp={pressEnterEvent}
                        />
                        {errorForm.password?.error && <div className='text-error'>{errorForm.password?.message}</div>}
                    </FormGroup>
                    <FormGroup>
                        <Button
                            color="primary" 
                            variant="contained"
                            onClick={onSubmit}
                            className='text-center w-100 btn-no-border'
                        >
                            Đăng nhập
                        </Button>
                        <Button variant="text" className='text-center w-100 btn-no-border' onClick={() => goToForgotPassword()}>
                            Quên mật khẩu
                        </Button>
                    <div className='border'></div>
                    </FormGroup>
                <CardFooter>
                    <FormGroup>
                        <Button variant="contained" color="success" className='text-center w-100 btn-no-border' onClick={() => goToRegister()}>
                            Đăng kí tài khoản mới
                        </Button>
                    </FormGroup>
                </CardFooter>
            </Card>
        </div>)
}

export default Login