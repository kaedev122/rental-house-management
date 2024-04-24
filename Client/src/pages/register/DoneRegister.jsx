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

const DoneRegister = () => {
    const navigate = useNavigate();

    const goToLogin = () => {
        return navigate("/login")
    }

    return (
        <div className='form'>
            <div className="logo">RoomMaster</div>
            <Card 
                className="my-2"
            >                
                <CardHeader>
                    <label className='d-flex justify-content-center'>Đăng ký thành công, Vui lòng truy cập vào email để xác thực tài khoản!</label>
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