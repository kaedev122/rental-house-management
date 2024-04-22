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

const ModalChangePassword = (props) => {
	const { _modal, _toggleModal, _done_action, _userData } = props;
    console.log(_userData)
	const apartmentCurrent = useSelector((state) => state.apartment?.current) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [dataAdd, setDataAdd] = useState({})
	const [errorForm, setErrorForm] = useState({})

    const onSubmit = async () => {
        if (is_empty(dataAdd.oldPassword)) {
			return setErrorForm({
				"oldPassword": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (is_empty(dataAdd.newPassword)) {
			return setErrorForm({
				"newPassword": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (is_empty(dataAdd.rePassword)) {
			return setErrorForm({
				"rePassword": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (dataAdd.newPassword !== dataAdd.rePassword) {
            return setErrorForm({
                "rePassword": {
                    "error": true,
                    "message": "Mật khẩu nhập lại không khớp!"
                }
            })
        }

        let input = {
            oldPassword: dataAdd.oldPassword,
            newPassword: dataAdd.newPassword
        }
		const res = await http_request({ method: "POST", url: `auth/change-password`, data: input })
		const { code, data, message } = res
        if (is_empty(res)) {
            return enqueueSnackbar("Có lỗi đã xảy ra!", {
                variant: "error",
                autoHideDuration: 5000,
            })
		}
        if (code === 200) {
            enqueueSnackbar("Đổi mật khẩu thành công", {
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
                Đổi mật khẩu
            </ModalHeader>
            <ModalBody>
                <FormGroup>
                    <TextField
                        id="oldPassword"
                        name="oldPassword"
                        error={errorForm.oldPassword?.error}
                        fullWidth={true}
                        label="Mật khẩu cũ"
                        type="password"
                        onChange={(e) =>
                            onChangeData("oldPassword", e.target.value)
                        }
                        onKeyUp={pressEnterEvent}
                    />
                    {errorForm.oldPassword?.error && <div className='text-error'>{errorForm.oldPassword?.message}</div>}
                </FormGroup>
                <FormGroup>
                    <TextField
                        id="newPassword"
                        name="newPassword"
                        error={errorForm.newPassword?.error}
                        fullWidth={true}
                        label="Mật khẩu mới"
                        type="password"
                        onChange={(e) =>
                            onChangeData("newPassword", e.target.value)
                        }
                        onKeyUp={pressEnterEvent}
                    />
                    {errorForm.newPassword?.error && <div className='text-error'>{errorForm.newPassword?.message}</div>}
                </FormGroup>                
                <FormGroup>
                    <TextField
                        id="rePassword"
                        name="rePassword"
                        error={errorForm.rePassword?.error}
                        fullWidth={true}
                        label="Nhập lại mật khẩu"
                        type="password"
                        onChange={(e) =>
                            onChangeData("rePassword", e.target.value)
                        }
                        onKeyUp={pressEnterEvent}
                    />
                    {errorForm.rePassword?.error && <div className='text-error'>{errorForm.rePassword?.message}</div>}
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

export default ModalChangePassword