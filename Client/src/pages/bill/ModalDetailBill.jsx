import React, { Fragment, useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Col, Row, Modal, ModalHeader, ModalBody, Label, ModalFooter, FormGroup, Input } from 'reactstrap'
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
import ModalPayBill from './ModalPayBill';
import { ModalDialog } from '@components'
import ExportBill from './ExportBill'

const ModalDetailBill = (props) => {
	const { _modal, _toggleModal, _done_action, _dataSelect } = props;
    const timer = useRef()

	const apartmentCurrent = useSelector((state) => state.apartment?.current) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [openDialog, setOpenDialog] = useState(false)

    const [listContract, setListContract] = useState([])
    const [contractSelected, setContractSelected] = useState(_dataSelect.contract._id)
    const [dataAdd, setDataAdd] = useState({
        contract: _dataSelect.contract._id,
        note: _dataSelect.note,
        water_number_used: "---",
        electric_number_used: "---",
        room_price: _dataSelect.room_price,
        other_price: _dataSelect.other_price,
        water_price: _dataSelect.water_price,
        electric_price: _dataSelect.electric_price,
        last_water_number: _dataSelect.last_water_number,
        last_electric_number: _dataSelect.last_electric_number,
        electric_number: _dataSelect.electric_number,
        water_number: _dataSelect.water_number,
        discount: _dataSelect.discount,
        cost_incurred: _dataSelect.cost_incurred,
        paid: _dataSelect.paid,
    })
	const [errorForm, setErrorForm] = useState({})

    useEffect(() => {
        console.log(_dataSelect)
        get_list_contract_data()
    }, [])

	const change_contract = async (contract_id) => {
		return setContractSelected(contract_id)
	}

    const calc_total_price_done = () => {
        return (dataAdd?.other_price || []).reduce((total, item) => {
            return total + item.price * item.number
        }, 0)
    }

    const calc_total_money = () => {
        return (((dataAdd.water_number - dataAdd.last_water_number) * dataAdd.water_price) 
            + ((dataAdd.electric_number - dataAdd.last_electric_number) * dataAdd.electric_price) + calc_total_price_done() 
            + dataAdd.room_price + dataAdd.cost_incurred - dataAdd.discount) || "---"
    }

    const get_list_contract_data = async () => {
        let input = {
            status: 1,
            apartment: apartmentCurrent,
        }
        const res = await http_request({method: "GET", url:`cms/contracts`, params: input})
		const { code, data, message } = res
        if (code == 200) {
            console.log(data.items)
            return setListContract(data.items)
        }
    }

    const onSubmit = async () => {
        let input = {
            note: dataAdd.note,
            water_number: dataAdd.water_number,
            electric_number: dataAdd.electric_number,
            discount: dataAdd.discount,
            cost_incurred: dataAdd.cost_incurred,
        }
		const res = await http_request({ method: "PUT", url: `cms/bill/${_dataSelect._id}`, data: input })
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

    const onEndBill = async () => {
		const res = await http_request({ method: "DELETE", url: `cms/bill/${_dataSelect._id}`})
		const { code, data, message } = res
        if (is_empty(res)) {
            return enqueueSnackbar("Có lỗi đã xảy ra!", {
                variant: "error",
                autoHideDuration: 5000,
            })
		}
        if (code === 200) {
            enqueueSnackbar("Đóng thành công", {
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
			const result = value.replace(/\D/g, "");
            if (type == 'start_electric_number' || type =='start_water_number') {
                return setDataAdd({
                    ...dataAdd,
                    [type]: parseInt(result) || 0,
                });
            }
			return setDataAdd({
				...dataAdd,
				[type]: parseInt(result) || '',
			});
		}
		return setDataAdd({
			...dataAdd,
			[type]: value
		})
	}

    const done_action = () => {

    }

    const confirm_close_bill = () => {
        setOpenDialog(false)
        return onEndBill()
    }

    const render_service_done = () => {
        return (dataAdd?.other_price || []).map((item, index) => {
            return (<TableRow key={item._id} item={item} index={index} sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell align="left">
                    {index + 1}
                </TableCell>
                <TableCell align="left">
                    {item.name}
                </TableCell>
                <TableCell align="left">
                    <Input
                        id="number"
                        name="number"
                        type="text"
                        disabled
                        className="form-control text-center"
                        placeholder="SL"
                        value={item.price.toLocaleString()}
                        min={1}
                    />
                </TableCell>
                <TableCell align="left">
                    <Input
                        id="number"
                        name="number"
                        type="text"
                        className="form-control text-center"
                        placeholder="SL"
                        disabled
                        value={item.number}
                        min={1}
                    />
                </TableCell>
            </TableRow>)
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
                Cập nhật hóa đơn
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col md={2}>
                        <Label>
                            Hợp đồng
                        </Label>
                    </Col>
                    <Col md={8}>
                        <Input
                            id="exampleSelect"
                            name="select"
                            type="select"
                            className='btn-select pointer-btn'
                            disabled
                            value={contractSelected}
                            onChange={(e)=>change_contract(e.target.value)}
                        >
                            <option value="" disabled selected hidden>Chọn hợp đồng</option>
                            {listContract && listContract.map((item) =>{
                                return (<option key={item._id} value={item._id} >{item.room.name} - {item.code} - {item.customer_represent.fullname} - {item.customer_represent.phone}</option>)
                            })}
                        </Input>
                    </Col>
                    <Col md={2}>
                        <ExportBill
                            _data={_dataSelect}
                            _apartment={apartmentCurrent}
                        />
                    </Col>
                </Row>
                <Row className='mt-3 mb-3 border-bottom'>
                    <Col md={1}>
                        <Row style={{height: '32px'}}>
                        </Row>
                        <Row style={{marginBottom: '22px'}}>
                            <Col md={12}>
                                <Label>
                                    Số nước
                                </Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Label>
                                    Số điện
                                </Label>
                            </Col>
                        </Row>
                    </Col>
                    <Col md={11}>
                        <Row>
                            <Col md={3}>
                                <Label>
                                    Kỳ này
                                </Label>
                            </Col>
                            <Col md={2}>
                                <Label>
                                    Kỳ trước
                                </Label>
                            </Col>
                            <Col md={2}>
                                <Label>
                                    Chênh lệch
                                </Label>
                            </Col>
                            <Col md={2}>
                                <Label>
                                    Giá một số
                                </Label>
                            </Col>
                            <Col md={3}>
                                <Label>
                                    Thành tiền
                                </Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={3}>
                                <Row>
                                    <FormGroup>
                                        <Input
                                            id="water_number"
                                            name="water_number"
                                            error={errorForm.water_number?.error}
                                            placeholder="Số nước"
                                            type="text"
                                            value={dataAdd.water_number}
                                            onChange={(e) =>
                                                onChangeData("water_number", e.target.value, true)
                                            }
                                        />
                                        {errorForm.water_number?.error && <div className='text-error'>{errorForm.water_number?.message}</div>}
                                    </FormGroup>
                                </Row>
                            </Col>
                            <Col md={2}>
                                <Row>
                                    <FormGroup>
                                        <Input
                                            id="last_water_number"
                                            name="last_water_number"
                                            error={errorForm.last_water_number?.error}
                                            placeholder="Số nước"
                                            disabled
                                            type="text"
                                            value={dataAdd.last_water_number}
                                            onChange={(e) =>
                                                onChangeData("last_water_number", e.target.value, true)
                                            }
                                        />
                                        {errorForm.last_water_number?.error && <div className='text-error'>{errorForm.last_water_number?.message}</div>}
                                    </FormGroup>
                                </Row>
                            </Col>
                            <Col md={2}>
                                <Row>
                                    <FormGroup>
                                        <Input
                                            id="water_number_used"
                                            name="water_number_used"
                                            error={errorForm.water_number_used?.error}
                                            placeholder="Số nước"
                                            disabled
                                            type="text"
                                            value={(dataAdd.water_number - dataAdd.last_water_number) || '---'}
                                            onChange={(e) =>
                                                onChangeData("water_number_used", e.target.value, true)
                                            }
                                        />
                                        {errorForm.water_number_used?.error && <div className='text-error'>{errorForm.water_number_used?.message}</div>}
                                    </FormGroup>
                                </Row>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Input
                                        id="water_price"
                                        name="water_price"
                                        error={errorForm.water_price?.error}
                                        placeholder="Số nước"
                                        type="text"
                                        disabled
                                        value={dataAdd.water_price ? dataAdd?.water_price.toLocaleString() : "---"}
                                        onChange={(e) =>
                                            onChangeData("water_price", e.target.value, true)
                                        }
                                    />
                                    {errorForm.water_price?.error && <div className='text-error'>{errorForm.water_price?.message}</div>}
                                </FormGroup>
                            </Col>
                            <Col md={3}>
                                <FormGroup>
                                    <Input
                                        id="total_water_price"
                                        name="total_water_price"
                                        error={errorForm.total_water_price?.error}
                                        placeholder="Số nước"
                                        type="text"
                                        disabled
                                        value={dataAdd.contract ? ((dataAdd.water_number - dataAdd.last_water_number) * dataAdd.water_price).toLocaleString() : '---'}
                                        onChange={(e) =>
                                            onChangeData("total_water_price", e.target.value, true)
                                        }
                                    />
                                    {errorForm.total_water_price?.error && <div className='text-error'>{errorForm.total_water_price?.message}</div>}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={3}>
                                <Row>
                                    <FormGroup>
                                        <Input
                                            id="electric_number"
                                            name="electric_number"
                                            error={errorForm.electric_number?.error}
                                            placeholder="Số điện"
                                            type="text"
                                            value={dataAdd.electric_number}
                                            onChange={(e) =>
                                                onChangeData("electric_number", e.target.value, true)
                                            }
                                        />
                                        {errorForm.electric_number?.error && <div className='text-error'>{errorForm.electric_number?.message}</div>}
                                    </FormGroup>
                                </Row>
                            </Col>
                            <Col md={2}>
                                <Row>
                                    <FormGroup>
                                        <Input
                                            id="last_electric_number"
                                            name="last_electric_number"
                                            error={errorForm.last_electric_number?.error}
                                            placeholder="Số điện"
                                            disabled
                                            type="text"
                                            value={dataAdd.last_electric_number}
                                            onChange={(e) =>
                                                onChangeData("last_electric_number", e.target.value, true)
                                            }
                                        />
                                        {errorForm.last_electric_number?.error && <div className='text-error'>{errorForm.last_electric_number?.message}</div>}
                                    </FormGroup>
                                </Row>
                            </Col>
                            <Col md={2}>
                                <Row>
                                    <FormGroup>
                                        <Input
                                            id="electric_number_used"
                                            name="electric_number_used"
                                            error={errorForm.electric_number_used?.error}
                                            placeholder="Số điện"
                                            disabled
                                            type="text"
                                            value={(dataAdd.electric_number - dataAdd.last_electric_number) || '---'}
                                            onChange={(e) =>
                                                onChangeData("electric_number_used", e.target.value, true)
                                            }
                                        />
                                        {errorForm.electric_number_used?.error && <div className='text-error'>{errorForm.electric_number_used?.message}</div>}
                                    </FormGroup>
                                </Row>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Input
                                        id="electric_price"
                                        name="electric_price"
                                        error={errorForm.electric_price?.error}
                                        placeholder="Số điện"
                                        type="text"
                                        disabled
                                        value={dataAdd.electric_price ? dataAdd?.electric_price.toLocaleString() : "---"}
                                        onChange={(e) =>
                                            onChangeData("electric_price", e.target.value, true)
                                        }
                                    />
                                    {errorForm.electric_price?.error && <div className='text-error'>{errorForm.electric_price?.message}</div>}
                                </FormGroup>
                            </Col>
                            <Col md={3}>
                                <FormGroup>
                                    <Input
                                        id="total_electric_price"
                                        name="total_electric_price"
                                        error={errorForm.total_electric_price?.error}
                                        placeholder="Số điện"
                                        type="text"
                                        disabled
                                        value={dataAdd.contract ? ((dataAdd.electric_number - dataAdd.last_electric_number) * dataAdd.electric_price).toLocaleString() : '---'}
                                        onChange={(e) =>
                                            onChangeData("total_electric_price", e.target.value, true)
                                        }
                                    />
                                    {errorForm.total_electric_price?.error && <div className='text-error'>{errorForm.total_electric_price?.message}</div>}
                                </FormGroup>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className='mb-3 border-bottom'>
                    <Col md={7}>
                        <Row>
                            <TableContainer style={{ width: '100%', height: "200px" }} component={Paper}>
                                <Table stickyHeader aria-label="collapsible table">
                                    <TableHead>
                                        <TableRow style={{backgroundColor:'white'}}>
                                            <TableCell width="50" align="left">
                                                STT
                                            </TableCell>
                                            <TableCell width="150" align="left">
                                                Tên dịch vụ
                                            </TableCell>
                                            <TableCell width="150" align="left">
                                                Giá tiền
                                            </TableCell>
                                            <TableCell width="100" align="left">
                                                SL
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {render_service_done()}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Row>
                    </Col>
                    <Col md={5} className='d-flex justify-content-center flex-column'>
                        <Row>
                            <Col md={5}>
                                <Label>
                                    Giá phòng
                                </Label>
                            </Col>
                            <Col md={7}>
                                <FormGroup>
                                    <Input
                                        id="room_price"
                                        name="room_price"
                                        error={errorForm.room_price?.error}
                                        placeholder="Giá phòng"
                                        type="text"
                                        disabled
                                        value={dataAdd.room_price ? dataAdd.room_price.toLocaleString() : "---"}
                                        onChange={(e) =>
                                            onChangeData("room_price", e.target.value, true)
                                        }
                                    />
                                    {errorForm.room_price?.error && <div className='text-error'>{errorForm.room_price?.message}</div>}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={5}>
                                <Label>
                                    Giá dịch vụ
                                </Label>
                            </Col>
                            <Col md={7}>
                                <FormGroup>
                                    <Input
                                        id="other_price"
                                        name="other_price"
                                        error={errorForm.other_price?.error}
                                        placeholder="Giá dịch vụ"
                                        type="text"
                                        disabled
                                        value={calc_total_price_done().toLocaleString() || "---"}
                                        onChange={(e) =>
                                            onChangeData("other_price", e.target.value, true)
                                        }
                                    />
                                    {errorForm.other_price?.error && <div className='text-error'>{errorForm.other_price?.message}</div>}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={5}>
                                <Label>
                                    Chi phí phát sinh
                                </Label>
                            </Col>
                            <Col md={7}>
                                <FormGroup>
                                    <Input
                                        id="cost_incurred"
                                        name="cost_incurred"
                                        error={errorForm.cost_incurred?.error}
                                        placeholder="Giá dịch vụ"
                                        type="text"
                                        value={dataAdd.cost_incurred.toLocaleString() || 0}
                                        onChange={(e) =>
                                            onChangeData("cost_incurred", e.target.value, true)
                                        }
                                    />
                                    {errorForm.cost_incurred?.error && <div className='text-error'>{errorForm.cost_incurred?.message}</div>}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={5}>
                                <Label>
                                    Giảm giá
                                </Label>
                            </Col>
                            <Col md={7}>
                                <FormGroup>
                                    <Input
                                        id="discount"
                                        name="discount"
                                        error={errorForm.discount?.error}
                                        placeholder="Giảm giá"
                                        type="text"
                                        value={dataAdd.discount.toLocaleString() || 0}
                                        onChange={(e) =>
                                            onChangeData("discount", e.target.value, true)
                                        }
                                    />
                                    {errorForm.discount?.error && <div className='text-error'>{errorForm.discount?.message}</div>}
                                </FormGroup>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col md={7}>
                        <FormGroup>
                            <Input
                                id="note"
                                name="note"
                                error={errorForm.note?.error}
                                placeholder="Ghi chú"
                                type="textarea"
                                rows={5}
                                value={dataAdd.note}
                                onChange={(e) =>
                                    onChangeData("note", e.target.value)
                                }
                            />
                            {errorForm.note?.error && <div className='text-error'>{errorForm.note?.message}</div>}
                        </FormGroup>
                    </Col>
                    <Col md={5}>
                        <Row>
                            <Col md={5}>
                                <Label>
                                    Tổng tiền
                                </Label>
                            </Col>
                            <Col md={7}>
                                <FormGroup>
                                    <Input
                                        id="total"
                                        name="total"
                                        error={errorForm.total?.error}
                                        placeholder="Tổng tiền"
                                        type="text"
                                        value={calc_total_money().toLocaleString() || "---"}
                                        disabled
                                        onChange={(e) =>
                                            onChangeData("total", e.target.value, true)
                                        }
                                    />
                                    {errorForm.total?.error && <div className='text-error'>{errorForm.total?.message}</div>}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={5}>
                                <Label>
                                    Đã trả
                                </Label>
                            </Col>
                            <Col md={7}>
                                <FormGroup>
                                    <Input
                                        id="total"
                                        name="total"
                                        error={errorForm.total?.error}
                                        placeholder="Tổng tiền"
                                        type="text"
                                        disabled
                                        value={dataAdd.paid.toLocaleString()}
                                        onChange={(e) =>
                                            onChangeData("total", e.target.value, true)
                                        }
                                    />
                                    {errorForm.total?.error && <div className='text-error'>{errorForm.total?.message}</div>}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={5}>
                                <Label>
                                    Còn nợ
                                </Label>
                            </Col>
                            <Col md={7}>
                                <FormGroup>
                                    <Input
                                        id="total"
                                        name="total"
                                        error={errorForm.total?.error}
                                        placeholder="Tổng tiền"
                                        type="text"
                                        disabled
                                        value={(calc_total_money() - dataAdd.paid).toLocaleString()}
                                        onChange={(e) =>
                                            onChangeData("total", e.target.value, true)
                                        }
                                    />
                                    {errorForm.total?.error && <div className='text-error'>{errorForm.total?.message}</div>}
                                </FormGroup>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter className='justify-content-between'>
                <div>
                    <Button
                        className="btn-custom save"
                        variant="contained"
                        color='error'
                        onClick={() => setOpenDialog(true)}
                    >
                        Đóng hóa đơn
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
                    >Lưu</Button>
                </div>
            </ModalFooter>
        </Modal>

        {openDialog && <ModalDialog
            title='Đóng hóa đơn'
            message='Bạn có muốn đóng hóa đơn này? Hành động này sẽ không thể hoàn tác!'
            open={openDialog}
            confirm={() => {
                confirm_close_bill()
            }}
            cancel={() => setOpenDialog(false)}
        />}
    </Fragment>)
}

export default ModalDetailBill