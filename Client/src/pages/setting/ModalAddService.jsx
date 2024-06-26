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
import { TextField, Button, } from '@mui/material';
import { useSnackbar } from 'notistack';
import "./setting.scss"

const ModalAddService= (props) => {
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
        if (is_empty(dataAdd.price)) {
			return setErrorForm({
				"price": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        let input = {
            name: dataAdd.name,
            price: dataAdd.price,
            apartment: apartmentCurrent,
        }
		const res = await http_request({ method: "POST", url: "cms/setting/service/", data: input })
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
                Thêm mới dịch vụ
            </ModalHeader>
            <ModalBody>
                <FormGroup>
                    <TextField
                        id="name"
                        name="name"
                        error={errorForm.name?.error}
                        fullWidth={true}
                        label="Tên dịch vụ"
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
                        id="price"
                        name="price"
                        error={errorForm.price?.error}
                        fullWidth={true}
                        label="Giá dịch vụ"
                        type="text"
                        value={dataAdd.price ? dataAdd.price.toLocaleString() : ""}
                        onChange={(e) =>
                            onChangeData("price", e.target.value, true)
                        }
                        onKeyUp={pressEnterEvent}
                        />
                    {errorForm.price?.error && <div className='text-error'>{errorForm.price?.message}</div>}
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

export default ModalAddService