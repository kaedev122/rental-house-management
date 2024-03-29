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
import "./Home.scss";
import { TextField, Button, } from '@mui/material';
import { useSnackbar } from 'notistack';

const ModalDetailRoom = (props) => {
	const { _modal, _toggleModal, _done_action, _dataSelect, _apartmentData } = props;
	const apartmentCurent = useSelector((state) => state.apartment?.curent) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [dataAdd, setDataAdd] = useState({
        name: _dataSelect.name,
        room_price: _dataSelect.room_price,
        water_price: _dataSelect.water_price,
        electric_price: _dataSelect.electric_price,
    })
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
            room_price: dataAdd.room_price,
            electric_price: dataAdd.electric_price,
            water_price: dataAdd.water_price,
        }
		const res = await http_request({ method: "PUT", url: `cms/room/${_dataSelect._id}`, data: input })
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

    const deleteRoom = async () => {
		const res = await http_request({ method: "DELETE", url: `cms/room/${_dataSelect._id}`})
		const { code, data, message } = res
        if (is_empty(res)) {
            return enqueueSnackbar("Có lỗi đã xảy ra!", {
                variant: "error",
                autoHideDuration: 5000,
            })
		}
        if (code === 200) {
            enqueueSnackbar("Xóa phòng thành công", {
                variant: "success",
                autoHideDuration: 5000,
            })
            return _done_action()
        }
        if (code === 500) {
            enqueueSnackbar(message, {
                variant: "error",
                autoHideDuration: 5000,
            })
        }
    }

    const pressEnterEvent = (event)=> {
        if (event.keyCode === 13) return onSubmit()
    }

	const onChangeData = (type, value, isNumber) => {
        setErrorForm({})
		if (isNumber) {
			const result = value.replace(/\D/g, "");
			return setDataAdd({
				...dataAdd,
				[type]: parseInt(result) || '',
			});
		}
        console.log(dataAdd)
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
                Cập nhật phòng
            </ModalHeader>
            <ModalBody>
                <FormGroup>
                    <TextField
                        id="name"
                        name="name"
                        error={errorForm.name?.error}
                        fullWidth={true}
                        label="Tên phòng"
                        type="text"
                        value={dataAdd.name}
                        onChange={(e) =>
                            onChangeData("name", e.target.value)
                        }
                        />
                    {errorForm.name?.error && <div className='text-error'>{errorForm.name?.message}</div>}
                </FormGroup>
                <FormGroup>
                    <TextField
                        id="room_price"
                        name="room_price"
                        error={errorForm.room_price?.error}
                        fullWidth={true}
                        label="Giá phòng"
                        type="text"
                        value={dataAdd.room_price}
                        onChange={(e) =>
                            onChangeData("room_price", e.target.value, true)
                        }
                        />
                    {errorForm.room_price?.error && <div className='text-error'>{errorForm.room_price?.message}</div>}
                </FormGroup>
                <FormGroup>
                    <TextField
                        id="electric_price"
                        name="electric_price"
                        error={errorForm.electric_price?.error}
                        fullWidth={true}
                        label={`Giá trên một số điện (Mặc định: ${_apartmentData?.electric_price})`}
                        type="text"
                        value={dataAdd.electric_price}
                        onChange={(e) =>
                            onChangeData("electric_price", e.target.value, true)
                        }
                        />
                    {errorForm.electric_price?.error && <div className='text-error'>{errorForm.electric_price?.message}</div>}
                </FormGroup>
                <FormGroup>
                    <TextField
                        id="water_price"
                        name="water_price"
                        error={errorForm.water_price?.error}
                        fullWidth={true}
                        label={`Giá trên một số nước (Mặc định: ${_apartmentData?.water_price})`}
                        type="text"
                        value={dataAdd.water_price}
                        onChange={(e) =>
                            onChangeData("water_price", e.target.value, true)
                        }
                        onKeyUp={pressEnterEvent}
                        />
                    {errorForm.water_price?.error && <div className='text-error'>{errorForm.water_price?.message}</div>}
                </FormGroup>
            </ModalBody>
            <ModalFooter className='justify-content-between'>
                <div>
                    <Button
                        className="btn-custom save"
                        variant="contained"
                        color='error'
                        onClick={() => deleteRoom()}
                    >
                        Xóa
                    </Button>
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

export default ModalDetailRoom