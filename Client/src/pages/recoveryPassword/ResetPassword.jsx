import React, { Fragment, useEffect, useState } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { Form, FormGroup, Label, Input, Card, CardBody, CardHeader, CardFooter } from 'reactstrap'
import { trim, set_authenticated_storage, http_request, get_local_storage, is_authenticated, set_local_storage, is_empty } from '@utils'
import "@styles/style.scss";
import "./recovery.scss";
import { TextField, Button, } from '@mui/material';
import { useSnackbar } from 'notistack';

const ResetPassword = () => {
	const location = useLocation();
    const navigate = useNavigate();

	const [dataAdd, setDataAdd] = useState({
		password: "",
		repassword: ""
	});
	const [errorForm, setErrorForm] = useState({})
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const onSubmit = async () => {
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
			"password": trim(dataAdd.password)
		}

		const res = await http_request({ method: "POST", url: "auth/new-password", data: input, recovery: true, path: location.pathname })
		const { code, data, message } = res
        if (is_empty(res)) {
		}
        if (code === 200) {
            enqueueSnackbar("Cài lại mật khẩu thành công!", {
                variant: "success",
                autoHideDuration: 5000,
            })
            localStorage.clear()
            sessionStorage.clear()
            return navigate("/login")
		} else {
            enqueueSnackbar(message, {
                variant: "success",
                autoHideDuration: 5000,
            })
			return setErrorForm({
				"repassword": {
					"error": true,
					"message": message
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

	const onCancel = () => {
        return navigate("/login")
	}

    return (
        <div className='form'>
            <div className="logo">RoomMaster</div>
            <Card 
                className="my-2"
            >
                <CardHeader>
                    <label className='d-flex justify-content-center'>Cài lại mật khẩu</label>
                </CardHeader>
                    <FormGroup>
                        <TextField
                            id="password"
                            name="password"
                            error={errorForm.password?.error}
                            fullWidth={true}
                            label="Mật khẩu"
                            value={dataAdd.password}
                            type="password"
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
                            error={errorForm.repassword?.error}
                            fullWidth={true}
                            label="Nhập lại mật khẩu"
                            type="password"
                            value={dataAdd.repassword}
                            onChange={(e) =>
                                onChangeData("repassword", e.target.value)
                            }
                        />
                        {errorForm.repassword?.error && <div className='text-error'>{errorForm.repassword?.message}</div>}
                    </FormGroup>
                <CardFooter>
					<div className='d-flex justify-content-end'>
						<Button
							className='me-2'
							variant="outlined" 
							color="error"
                            onClick={onCancel}
						>
                            Hủy
                        </Button>
                        <Button
							variant="contained"
                            onClick={onSubmit}
							>
                            Xác nhận
                        </Button>
					</div>
				</CardFooter>
            </Card>
        </div>)
}

export default ResetPassword