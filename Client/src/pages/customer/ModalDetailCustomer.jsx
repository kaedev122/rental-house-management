import React, { Fragment, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Col, Row, Modal, ModalHeader, ModalBody, Label, ModalFooter, FormGroup } from 'reactstrap'
import { http_request, get_local_storage, is_empty, } from '@utils'
import { format_date_time } from '@utils/format_time'
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FaBed, FaPhoneAlt, FaMoneyBillWaveAlt   } from "react-icons/fa";
import { IoPerson, IoPeopleSharp, IoWaterSharp } from "react-icons/io5";
import { RiWaterFlashFill } from "react-icons/ri";
import { BsPersonCircle, BsLightningChargeFill } from "react-icons/bs";
import { FaDollarSign, FaHandshakeSimple, FaHandshakeSimpleSlash } from "react-icons/fa6";
import "./Customer.scss";
import { TextField, Button, } from '@mui/material';
import { useSnackbar } from 'notistack';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateField } from '@mui/x-date-pickers/DateField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import dayjs from 'dayjs';

const ModalDetailCustomer = (props) => {
	const { _modal, _toggleModal, _done_action, _dataSelect } = props;
	const apartmentCurrent = useSelector((state) => state.apartment?.curent) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [dataAdd, setDataAdd] = useState(_dataSelect)
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
        if (is_empty(dataAdd.phone)) {
			return setErrorForm({
				"phone": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        let input = {
            ...dataAdd,
            apartment: apartmentCurrent,
            fullname: (dataAdd.firstname || '') + ' ' + dataAdd.lastname
        }
		const res = await http_request({ method: "PUT", url: `cms/customer/${_dataSelect._id}`, data: input })
		const { code, data, message } = res
        if (is_empty(res)) {
            return enqueueSnackbar("Có lỗi đã xảy ra!", {
                variant: "error",
                autoHideDuration: 5000,
            })
		}
        if (code === 200) {
            enqueueSnackbar("Cập nhật thành công", {
                variant: "success",
                autoHideDuration: 5000,
            })
            return _done_action()
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

    const changeStatus = async (status) => {
        let input = {
            status: status
        }
		const res = await http_request({ method: "PUT", url: `cms/customer/${_dataSelect._id}`, data: input })
		const { code, data, message } = res
        if (is_empty(res)) {
            return enqueueSnackbar("Có lỗi đã xảy ra!", {
                variant: "error",
                autoHideDuration: 5000,
            })
		}
        if (code === 200) {
            enqueueSnackbar("Ngưng hoạt động thành công", {
                variant: "success",
                autoHideDuration: 5000,
            })
            return _done_action()
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

    const pressEnterEvent = (event)=> {
        if (event.keyCode === 13) return onSubmit()
    }

	const onChangeData = (type, value) => {
        setErrorForm({})
        if (type == "birthday"){
            value = value.$d
        }
		return setDataAdd({
			...dataAdd,
			[type]: value
		})
	}

    return (<Fragment>
        <Modal 				
            isOpen={_modal}
            toggle={_toggleModal}
            className="modal-custom"
            size="xl"
        >
            <ModalHeader toggle={_toggleModal}>
                Thêm mới khách thuê
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col md={6}>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <TextField
                                        id="firstname"
                                        name="firstname"
                                        error={errorForm.firstname?.error}
                                        fullWidth={true}
                                        label="Họ"
                                        type="text"
                                        defaultValue={dataAdd.firstname}
                                        onChange={(e) =>
                                            onChangeData("firstname", e.target.value)
                                        }
                                    />
                                    {errorForm.firstname?.error && <div className='text-error'>{errorForm.firstname?.message}</div>}
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <TextField
                                        id="lastname"
                                        name="lastname"
                                        error={errorForm.lastname?.error}
                                        fullWidth={true}
                                        label="Tên"
                                        required
                                        type="text"
                                        defaultValue={dataAdd.lastname}
                                        onChange={(e) =>
                                            onChangeData("lastname", e.target.value)
                                        }
                                    />
                                    {errorForm.lastname?.error && <div className='text-error'>{errorForm.lastname?.message}</div>}
                                </FormGroup>
                            </Col>
                        </Row>
                        <FormGroup>
                            <TextField
                                id="phone"
                                name="phone"
                                error={errorForm.phone?.error}
                                fullWidth={true}
                                label="Số điện thoại liên hệ"
                                type="text"
                                required
                                defaultValue={dataAdd.phone}
                                onChange={(e) =>
                                    onChangeData("phone", e.target.value)
                                }
                            />
                            {errorForm.phone?.error && <div className='text-error'>{errorForm.phone?.message}</div>}
                        </FormGroup>
                        <FormGroup>
                            <TextField
                                id="email"
                                name="email"
                                error={errorForm.email?.error}
                                fullWidth={true}
                                label="Email"
                                type="text"
                                defaultValue={dataAdd.email}
                                onChange={(e) =>
                                    onChangeData("email", e.target.value)
                                }
                            />
                            {errorForm.email?.error && <div className='text-error'>{errorForm.email?.message}</div>}
                        </FormGroup>
                    </Col>
                    <Col md={6}>
                        <FormGroup>
                            <TextField
                                id="id_number"
                                name="id_number"
                                error={errorForm.id_number?.error}
                                fullWidth={true}
                                label="Số căn cước"
                                type="text"
                                defaultValue={dataAdd.id_number}
                                onChange={(e) =>
                                    onChangeData("id_number", e.target.value)
                                }
                            />
                            {errorForm.id_number?.error && <div className='text-error'>{errorForm.id_number?.message}</div>}
                        </FormGroup>
                        <FormGroup>
                            <TextField
                                id="address"
                                name="address"
                                error={errorForm.address?.error}
                                fullWidth={true}
                                label="Địa chỉ"
                                type="text"
                                defaultValue={dataAdd.address}
                                onChange={(e) =>
                                    onChangeData("address", e.target.value)
                                }
                            />
                            {errorForm.address?.error && <div className='text-error'>{errorForm.address?.message}</div>}
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
                                    value={dataAdd.birthday ? dayjs(dataAdd.birthday) : undefined}
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
                    </Col>
                </Row>

            </ModalBody>
            <ModalFooter className='justify-content-between'>
                <div>
                    {_dataSelect.status !== 0 ? <Button
                        className="btn-custom save"
                        variant="contained"
                        color='error'
                        onClick={() => changeStatus(0)}
                    >
                        KHÓA
                    </Button> : <Button
                        className="btn-custom save"
                        variant="contained"
                        color='success'
                        onClick={() => changeStatus(1)}
                    >
                        MỞ
                    </Button> }
                </div>
                <div>
                    <Button className="btn-custom cancel" onClick={_toggleModal}>
                        Hủy bỏ
                    </Button>
                    <Button
                        className="btn-custom save"
                        variant="contained"
                        onClick={onSubmit}
                    >
                        Lưu
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    </Fragment>)
}

export default ModalDetailCustomer