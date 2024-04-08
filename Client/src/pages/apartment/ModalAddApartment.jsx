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
import "./Apartment.scss";
import { TextField, Button, } from '@mui/material';
import { useSnackbar } from 'notistack';

const ModalAddApartment = (props) => {
	const { _modal, _toggleModal, _done_action } = props;
	const apartmentCurrent = useSelector((state) => state.apartment?.current) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [dataAdd, setDataAdd] = useState({})
	const [errorForm, setErrorForm] = useState({})

    const onSubmit = async () => {
        if (is_empty(dataAdd.name)) {
			return setErrorForm({
				"name": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        let input = {
            name: dataAdd.name,
            phone: dataAdd.phone,
            address: dataAdd.address,
            water_price: dataAdd.water_price,
            electric_price: dataAdd.electric_price,
        }
		const res = await http_request({ method: "POST", url: "cms/apartment/", data: input })
		const { code, data, message } = res
        if (is_empty(res)) {
            return enqueueSnackbar("Có lỗi đã xảy ra!", {
                variant: "error",
                autoHideDuration: 5000,
            })
		}
        if (code === 200) {
            enqueueSnackbar("Thêm mới thành công", {
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
            size="l"
        >
            <ModalHeader toggle={_toggleModal}>
                Thêm mới nhà trọ
            </ModalHeader>
            <ModalBody>
            <FormGroup>
                <TextField
                    id="name"
                    name="name"
                    error={errorForm.name?.error}
                    fullWidth={true}
                    label="Tên nhà trọ"
                    type="text"
                    onChange={(e) =>
                        onChangeData("name", e.target.value)
                    }
                />
                {errorForm.name?.error && <div className='text-error'>{errorForm.name?.message}</div>}
            </FormGroup>
            <FormGroup>
                <TextField
                    id="phone"
                    name="phone"
                    error={errorForm.phone?.error}
                    fullWidth={true}
                    label="Số điện thoại liên hệ"
                    type="text"
                    onChange={(e) =>
                        onChangeData("phone", e.target.value)
                    }
                />
                {errorForm.phone?.error && <div className='text-error'>{errorForm.phone?.message}</div>}
            </FormGroup>
            <FormGroup>
                <TextField
                    id="address"
                    name="address"
                    error={errorForm.address?.error}
                    fullWidth={true}
                    label="Địa chỉ"
                    type="text"
                    onChange={(e) =>
                        onChangeData("address", e.target.value)
                    }
                />
                {errorForm.address?.error && <div className='text-error'>{errorForm.address?.message}</div>}
            </FormGroup>
            <FormGroup>
                <TextField
                    id="water_price"
                    name="water_price"
                    error={errorForm.water_price?.error}
                    fullWidth={true}
                    label="Giá tiền một số nước"
                    type="text"
                    onChange={(e) =>
                        onChangeData("water_price", e.target.value)
                    }
                />
                {errorForm.water_price?.error && <div className='text-error'>{errorForm.water_price?.message}</div>}
            </FormGroup>
            <FormGroup>
                <TextField
                    id="electric_price"
                    name="electric_price"
                    error={errorForm.water_price?.error}
                    fullWidth={true}
                    label="Giá tiền một số điện"
                    type="text"
                    onChange={(e) =>
                        onChangeData("electric_price", e.target.value)
                    }
                    onKeyUp={pressEnterEvent}
                />
                {errorForm.electric_price?.error && <div className='text-error'>{errorForm.electric_price?.message}</div>}
            </FormGroup>

            </ModalBody>
            <ModalFooter>
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
            </ModalFooter>
        </Modal>
    </Fragment>)
}

export default ModalAddApartment