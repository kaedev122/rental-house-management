import React, { Fragment, useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, CardHeader, CardBody, CardFooter, Col, Row, Modal, ModalHeader, ModalBody, Label, ModalFooter, FormGroup, Input, InputGroup } from 'reactstrap'
import { http_request, get_local_storage, is_empty, trim } from '@utils'
import "./bill.scss";
import { TextField, Button, } from '@mui/material';
import { useSnackbar } from 'notistack';
import { FaEdit } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const ModalPayBill = (props) => {
	const { _modal, _toggleModal, _done_action, _dataSelect } = props;
    console.log(_dataSelect)
    const timer = useRef()
	const apartmentCurrent = useSelector((state) => state.apartment?.curent) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [dataAdd, setDataAdd] = useState({
        paid: _dataSelect.paid,
        total: _dataSelect.total,
        debt: _dataSelect.debt,
        money: 0,
    })
	const [errorForm, setErrorForm] = useState({})

    const calc_total_price_done = () => {
        return (dataAdd?.other_price || []).reduce((total, item) => {
            return total + item.price * item.number
        }, 0)
    }

    const onSubmit = async () => {
        let input = {
            money: dataAdd.money
        }
		const res = await http_request({ method: "POST", url: `cms/pay-bill/${_dataSelect._id}`, data: input })
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

	const onChangeData = (type, value, isNumber) => {
        setErrorForm({})
        if (isNumber) {
			let result = value.replace(/\D/g, "");
            const checkMax = parseInt(value)
            if (checkMax > dataAdd.debt) {
                result = dataAdd.debt
            }
            if (type == 'start_electric_number' || type =='start_water_number') {
                return setDataAdd({
                    ...dataAdd,
                    [type]: parseInt(result) || 0,
                });
            }
			return setDataAdd({
				...dataAdd,
				[type]: parseInt(result) || 0,
			});
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
            size="m"
        >
            <ModalHeader toggle={_toggleModal}>
                Thanh toán hóa đơn
            </ModalHeader>
            <ModalBody>
                <Row className='border-bottom'>
                    <Label>
                        Hóa đơn: {_dataSelect?.code} - Phòng: {_dataSelect?.room?.name}
                    </Label>
                </Row>
                <Row className='mt-3'>
                    <Col md={4}>
                        <Label>
                            Tổng tiền phải trả
                        </Label>
                    </Col>
                    <Col md={8}>
                        <FormGroup>
                            <Input
                                id="total"
                                name="total"
                                error={errorForm.total?.error}
                                placeholder="Tổng tiền"
                                type="text"
                                disabled
                                value={dataAdd.total}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md={4}>
                        <Label>
                            Tổng tiền đã trả
                        </Label>
                    </Col>
                    <Col md={8}>
                        <FormGroup>
                            <Input
                                id="total"
                                name="total"
                                error={errorForm.total?.error}
                                placeholder="Tổng tiền"
                                type="text"
                                disabled
                                value={dataAdd.paid}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row className='border-bottom'>
                    <Col md={4}>
                        <Label>
                            Tổng tiền còn nợ
                        </Label>
                    </Col>
                    <Col md={8}>
                        <FormGroup>
                            <Input
                                id="total"
                                name="total"
                                error={errorForm.total?.error}
                                placeholder="Tổng tiền"
                                type="text"
                                disabled
                                value={dataAdd.debt}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row className='mt-3'>
                    <Col md={4}>
                        <Label>
                            Thanh toán
                        </Label>
                    </Col>
                    <Col md={8}>
                        <FormGroup>
                            <InputGroup>
                                <Input 
                                    id="total"
                                    name="total"
                                    error={errorForm.total?.error}
                                    placeholder="Tổng tiền"
                                    type="text"
                                    disabled={!dataAdd.debt}
                                    value={dataAdd.money}
                                    onChange={(e) =>
                                        onChangeData("money", e.target.value, true)
                                    }
                                />
                                <Button
                                    disabled={!dataAdd.debt}
                                    onClick={() => onChangeData("money", (dataAdd.debt).toString(), true)}
                                >
                                    Toàn bộ
                                </Button>
                            </InputGroup>
                            {errorForm.total?.error && <div className='text-error'>{errorForm.total?.message}</div>}
                        </FormGroup>
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button className="btn-custom cancel" onClick={_toggleModal}>
                    Hủy bỏ
                </Button>
                <Button
                    className="btn-custom save"
                    variant="contained"
                    onClick={onSubmit}
                >Lưu</Button>
            </ModalFooter>
        </Modal>
    </Fragment>)
}


export default ModalPayBill