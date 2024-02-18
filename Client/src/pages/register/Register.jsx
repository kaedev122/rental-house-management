import React, { Fragment, useEffect, useState } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { Form, FormGroup, Label, Input, InputGroup, InputGroupText, Card, CardBody, CardHeader, CardFooter, Row, Col } from 'reactstrap'
import { trim, set_authenticated_storage, http_request, get_local_storage, is_authenticated, set_local_storage, is_empty } from '@utils'
import "@styles/style.scss";
import "./register.scss";
import { FaTriangleExclamation } from "react-icons/fa6";
import { useSnackbar } from 'notistack';
import { TextField, Button } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateField } from '@mui/x-date-pickers/DateField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

const Register = () => {
    const navigate = useNavigate();
	const location = useLocation();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const [dataAdd, setDataAdd] = useState({
		username: "",
		password: "",
        repassword: "",
        email: "",
        phone: "",
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
			"password": trim(dataAdd.password),
            "email": trim(dataAdd.email),
            'phone': trim(dataAdd.phone),
            'birthday': dataAdd.birthday,
            'sex': trim(dataAdd.sex),
            'fullname': `${trim(dataAdd.firstname)} ${trim(dataAdd.lastname)}`,
            'address': trim(dataAdd.address),
		}
		const res = await http_request({ method: "POST", url: "auth/register", data: input })
		const { code, data, message } = res
        if (is_empty(res)) {
            return enqueueSnackbar("Có lỗi đã xảy ra!", {
                variant: "error",
                autoHideDuration: 5000,
            })
		}
        if (code === 200) {
            enqueueSnackbar("Đăng ký thành công, vui lòng xác thực email!", {
                variant: "success",
                autoHideDuration: 5000,
            })
            return navigate("/done-register")
		} else {
            return enqueueSnackbar(message, {
                variant: "error",
                autoHideDuration: 5000,
            })
		}
    }

	const onChangeData = (type, value) => {
        setErrorForm({})
        console.log(type)
        console.log(value)
        if (type == "birthday"){
            value = value.$d
        }
		return setDataAdd({
			...dataAdd,
			[type]: value
		})
	}

    const goToLogin = () => {
        return navigate("/login")
    }

    return (
        <div className='form'>
            <div>LOGO</div>
            <Card 
                className="my-2"
            >
                <CardHeader>
                    <label className='d-flex justify-content-center'>Đăng ký tài khoản LodgingPro</label>
                </CardHeader>
                    <FormGroup className=''>
                    <div className='d-flex justify-content-between'> 
                        <TextField
                            id="firstname"
                            name="firstname"
                            error={errorForm.firstname?.error}
                            label="Họ"
                            fullWidth={true}
                            type="firstname"
                            value={dataAdd.firstname}
                            onChange={(e) =>
                                onChangeData("firstname", e.target.value)
                            }
                        />
                        <TextField
                            className="ms-2"
                            id="lastname"
                            name="lastname"
                            required
                            error={errorForm.lastname?.error}
                            label="Tên"
                            fullWidth={true}
                            type="lastname"
                            value={dataAdd.lastname}
                            onChange={(e) =>
                                onChangeData("lastname", e.target.value)
                            }
                        />
                    </div>
                    {errorForm.lastname?.error && <div className='text-error text-end'>{errorForm.lastname?.message}</div>}
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            id="username"
                            name="username"
                            required
                            error={errorForm.username?.error}
                            label="Tên đăng nhập"
                            fullWidth={true}
                            type="username"
                            value={dataAdd.username}
                            onChange={(e) =>
                                onChangeData("username", e.target.value)
                            }
                        />
                        {errorForm.username?.error && <div className='text-error'>{errorForm.username?.message}</div>}
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            id="email"
                            name="email"
                            required
                            error={errorForm.email?.error}
                            label="Email"
                            fullWidth={true}
                            type="email"
                            value={dataAdd.email}
                            onChange={(e) =>
                                onChangeData("email", e.target.value)
                            }
                        />
                    {errorForm.email?.error && <div className='text-error'>{errorForm.email?.message}</div>}
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            id="phone"
                            name="phone"
                            required
                            error={errorForm.phone?.error}
                            label="Số điện thoại"
                            fullWidth={true}
                            type="phone"
                            value={dataAdd.phone}
                            onChange={(e) =>
                                onChangeData("phone", e.target.value)
                            }
                        />
                        {errorForm.phone?.error && <div className='text-error'>{errorForm.phone?.message}</div>}
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            id="password"
                            name="password"
                            required
                            error={errorForm.password?.error}
                            label="Mật khẩu"
                            fullWidth={true}
                            type="password"
                            value={dataAdd.password}
                            onChange={(e) =>
                                onChangeData("password", e.target.value)
                            }
                        />
                        {errorForm.password?.error && <div className='text-error'>{errorForm.password?.message}</div>}
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            id="repassword"
                            name="repassword"
                            required
                            error={errorForm.repassword?.error}
                            label="Nhập lại mật khẩu"
                            fullWidth={true}
                            type="password"
                            value={dataAdd.repassword}
                            onChange={(e) =>
                                onChangeData("repassword", e.target.value)
                            }
                        />
                        {errorForm.repassword?.error && <div className='text-error'>{errorForm.repassword?.message}</div>}
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            id="address"
                            name="address"
                            error={errorForm.address?.error}
                            label="Địa chỉ"
                            fullWidth={true}
                            type="address"
                            value={dataAdd.address}
                            onChange={(e) =>
                                onChangeData("address", e.target.value)
                            }
                        />
                    </FormGroup>
                    <FormGroup>
                        <div className='d-flex'>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateField  
                                className="me-2" 
                                id="birthday"
                                name="birthday"
                                label="Ngày sinh"
                                type="birthday"
                                format="DD/MM/YYYY"
                                value={dataAdd.birthday}
                                onChange={(e) => onChangeData("birthday", e)}
                            />
                        </LocalizationProvider>

                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel id="sex-label">Giới tính</InputLabel>
                            <Select
                                labelId="sex-label"
                                id="sex"
                                name="sex"
                                value={dataAdd.sex}
                                label="Giới tính"
                                autoWidth
                                onChange={(e) => onChangeData("sex", e.target.value)}
                            >
                                <MenuItem value={'Nam'}>Nam</MenuItem>
                                <MenuItem value={'Nữ'}>Nữ</MenuItem>
                                <MenuItem value={'Khác'}>Khác</MenuItem>
                            </Select>
                        </FormControl>
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <Button
                            onClick={onSubmit}                            
                            color="success" 
                            variant="contained"
                            className='text-center w-100 btn-no-border'
                        >
                            Đăng ký
                        </Button>
                    <div className='border'></div>
                    </FormGroup>
                <CardFooter>
                    <FormGroup>
                        <Button variant="text" className='text-center w-100 btn-no-border' onClick={() => goToLogin()}>
                            Bạn đã có tài khoản?
                        </Button>
                    </FormGroup>
                </CardFooter>
            </Card>
        </div>)
}

export default Register