import React, { Fragment, useEffect, useState } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { Form, FormGroup, Label, Input, Card, CardBody, CardHeader, CardFooter } from 'reactstrap'
import { trim, set_authenticated_storage, http_request, get_local_storage, is_authenticated, set_local_storage, is_empty } from '@utils'
import "@styles/style.scss";
import "./recovery.scss";
import OtpInput from "otp-input-react"
import { TextField, Button, } from '@mui/material';
import { useSnackbar } from 'notistack';

const Recovery = () => {
	const location = useLocation();
    const navigate = useNavigate();

	const [dataAdd, setDataAdd] = useState({
		email: "",
		recoveryCode: ""
	});
	const [recoveryCode, setRecoveryCode] = useState('')
	const [errorForm, setErrorForm] = useState({})
	const [emailSended, setEmailSended] = useState(false)
	const [seconds, setSeconds] = useState();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	useEffect(() => {
		const intervalId = setInterval(() => {
			if (seconds > 0) {
				setSeconds(prevSeconds => prevSeconds - 1);
			}
		}, 1000);
		return () => clearInterval(intervalId);
	}, [seconds]);

	const formatTime = (time) => {
		const minutes = Math.floor(time / 60);
		const remainingSeconds = time % 60;
		return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
	};

    const onSubmit = async () => {
		if (is_empty(dataAdd.email)) {
			return setErrorForm({
				"email": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        const input = {
			"email": trim(dataAdd.email),
		}
		const res = await http_request({ method: "POST", url: "auth/send-email-recovery", data: input })
		const { code, data, message } = res
		console.log(res)
        if (is_empty(res) || code == "EAUTH") {
			setEmailSended(false)
			return enqueueSnackbar("Hệ thống đang bảo trì!", {
				variant: "error",
				autoHideDuration: 5000,
			})
		}
        if (code === 200 || code === 400) {
			setEmailSended(true)
			setSeconds(120)
			return enqueueSnackbar(data || message, {
				variant: "success",
				autoHideDuration: 5000,
			})
		} else {
			return enqueueSnackbar(message, {
				variant: "error",
				autoHideDuration: 5000,
			})
		}
    }

	const onRecovery = async () => {
		if (is_empty(recoveryCode)) {
			return setErrorForm({
				"recoveryCode": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        const input = {
			"email": trim(dataAdd.email),
			"recoveryCode": trim(recoveryCode)
		}
		const res = await http_request({ method: "POST", url: "auth/password-recovery", data: input })
		const { code, data, message } = res
        if (is_empty(res)) {
			return enqueueSnackbar("Có lỗi đã xảy ra!", {
				variant: "error",
				autoHideDuration: 5000,
			})
		}
        if (code === 200) {
			set_authenticated_storage(data)
			return onSuccess()
		} else {
			enqueueSnackbar(message, {
				variant: "error",
				autoHideDuration: 5000,
			})
			return setErrorForm({
				"recoveryCode": {
					"error": true,
					"message": message
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

	const onCancel = () => {
        return navigate("/login")
	}

	const onSuccess = () => {
        return navigate("/reset-password")
	}

	const reSendEmail = () => {
		return onSubmit()
	}
	
    return (
        <div className='form'>
            <div>LOGO</div>
            {!emailSended ? <Card 
                className="my-2"
            >
                <CardHeader>
                    <label className='d-flex justify-content-center'>Vui lòng nhập email dùng để đăng ký tài khoản của bạn</label>
                </CardHeader>
				<CardBody>
                    <FormGroup>
                        <TextField
                            id="email"
                            name="email"
                            error={errorForm.email?.error}
                            label="Email"
                            fullWidth={true}
                            type="email"
                            onChange={(e) =>
                                onChangeData("email", e.target.value)
                            }
                        />
                        {errorForm.email?.error && <div className='text-error'>{errorForm.email?.message}</div>}
                    </FormGroup>
				</CardBody>
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
            </Card> : <Card
                className="my-2"
			>
				<CardHeader>
                    <label className='d-flex justify-content-center'>Vui lòng nhập email dùng để đăng ký tài khoản của bạn</label>
                </CardHeader>
				<CardBody>
					<FormGroup
						className='d-flex justify-content-center otp-container'
					>
						<Button
							variant="contained"
							color='success'
                            onClick={reSendEmail}
							disabled={seconds != 0}
						>
                            Gửi lại mã {formatTime(seconds)}
                        </Button>
					</FormGroup>
					<FormGroup>
						<OtpInput 
							OTPLength={6}
							otpType="number"
							className='d-flex justify-content-center otp-container'
							value={recoveryCode}
							onChange={setRecoveryCode}
						>
						</OtpInput>
					</FormGroup>
					{errorForm.recoveryCode?.error && <div className='text-error text-center'>{errorForm.recoveryCode?.message}</div>}
				</CardBody>
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
                            onClick={onRecovery}
						>
                            Xác nhận
                        </Button>
					</div>
				</CardFooter>
			</Card>}
        </div>)
}

export default Recovery