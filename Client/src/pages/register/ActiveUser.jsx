import React, { Fragment, useEffect, useState } from 'react'
import { useNavigate, Navigate, useLocation, useParams } from 'react-router-dom'
import { Form, FormGroup, Label, Input, InputGroup, InputGroupText, Card, CardBody, CardHeader, CardFooter, Row, Col } from 'reactstrap'
import { trim, set_authenticated_storage, http_request, get_local_storage, is_authenticated, set_local_storage, is_empty } from '@utils'
import "@styles/style.scss";
import "./register.scss";
import { useSnackbar } from 'notistack';
import { TextField, Button } from '@mui/material';

const DoneRegister = () => {
    const navigate = useNavigate();
    const {activeCode} = useParams()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [msg, setMsg] = useState('')

    const goToLogin = () => {
        return navigate("/login")
    }
    
    const onSubmit = async () => {
		const res = await http_request({ method: "POST", url: `auth/active/${activeCode}` })
		const { code, data, message } = res
        if (code === 200 || code === 400) {
            enqueueSnackbar("Xác thực thành công", {
                variant: "success",
                autoHideDuration: 5000,
            })
            return setMsg("Xác thực thành công")
        } else {
            enqueueSnackbar(message, {
                variant: "success",
                autoHideDuration: 5000,
            })
            return setMsg(message)
        }
    }

    useEffect(() => {
        onSubmit()
    }, [])

    return (
        <div className='form'>
            <div className="logo">RoomMaster</div>
            <Card 
                className="my-2"
            >                
                <CardHeader>
                    <label className='d-flex justify-content-center'>Xác thực thành công</label>
                </CardHeader>
                <CardFooter>
                    <FormGroup>
                        <Button                             
                        color="success" 
                            variant="contained" className='text-center w-100 btn-no-border' onClick={() => goToLogin()}>
                            Quay lại
                        </Button>
                    </FormGroup>
                </CardFooter>
            </Card>
        </div>)
}

export default DoneRegister