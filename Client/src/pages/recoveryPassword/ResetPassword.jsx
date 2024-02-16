import React, { Fragment, useEffect, useState } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { Button, Form, FormGroup, Label, Input, Card, CardBody, CardHeader, CardFooter } from 'reactstrap'
import { trim, set_authenticated_storage, http_request, get_local_storage, is_authenticated, set_local_storage, is_empty } from '@utils'
import "@styles/style.scss";
import "./recovery.scss";

const ResetPassword = () => {
	const location = useLocation();
    const navigate = useNavigate();

	const [dataAdd, setDataAdd] = useState({
		password: "",
		repassword: ""
	});
	const [errorForm, setErrorForm] = useState({})

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
			return dispatch(show_notification({
				"type": "danger",
				"message": "Hệ thống đang bảo trì!",
			}))
		}
        if (code === 200) {
            localStorage.clear()
            sessionStorage.clear()
            return navigate("/login")
		} else {
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
            <div>LOGO</div>
            <Card 
                className="my-2"
            >
                <CardHeader>
                    <label className='d-flex justify-content-center'>Cài lại mật khẩu</label>
                </CardHeader>
                    <FormGroup>
                        <Input
                            id="password"
                            name="password"
                            placeholder="Mật khẩu mới"
                            type="password"
                            onChange={(e) =>
                                onChangeData("password", e.target.value)
                            }
                        />
                        {errorForm.username?.error && <div className='text-error'>{errorForm.username?.message}</div>}
                    </FormGroup>
                    <FormGroup>
                        <Input
                            id="repassword"
                            name="repassword"
                            placeholder="Nhập lại mật khẩu"
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
						<Button color='secondary'
							className='mx-2'
                            onClick={onCancel}
						>
                            Hủy
                        </Button>
                        <Button color='primary'
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