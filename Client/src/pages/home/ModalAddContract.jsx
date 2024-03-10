import React, { Fragment, useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Col, Row, Modal, ModalHeader, ModalBody, Label, ModalFooter, FormGroup, Input } from 'reactstrap'
import { http_request, get_local_storage, is_empty, trim } from '@utils'
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
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Tab, Grid, Stack } from '@mui/material'
import Select from 'react-select'
import { DataGrid } from '@mui/x-data-grid';
import { FaEdit } from "react-icons/fa";
import { SearchData } from '@components'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddContract = (props) => {
	const { _modal, _toggleModal, _done_action, _room_selected } = props;
    const timer = useRef()

	const apartmentCurent = useSelector((state) => state.apartment?.curent) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [listRoom, setListRoom] = useState([])
    const [roomData, setRoomData] = useState({})
    const [roomSelected, setRoomSelected] = useState(_room_selected)
    const [represent, setRepresent] = useState()

    const [listCustomer, setListCustomer] = useState([])

    const [dataAdd, setDataAdd] = useState({})
	const [errorForm, setErrorForm] = useState({})

    const [tabSelected, setTabSelected] = useState("1")
    const selectTab = (e) => {
        setTabSelected(e)
    }

    const [dataSearch, setDataSearch] = useState({})

    const [listCurrentCustomer, setListCurrentCustomer] = useState([]);
    const [listCustomerSelected, setListCustomerSelected] = useState([]);
    const [listCustomerSelectedData, setListCustomerSelectedData] = useState([]);

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    useEffect(() => {
        get_list_room_data()
        // get_list_customer()
        async function getCustomerData() {
            let result = await get_list_customer()
            setListCustomer(result)
        }
        getCustomerData()
    }, [])

    useEffect(() => {
        get_room_data(roomSelected)
        console.log(listCustomer)
    }, [roomSelected])
    
    useEffect(() => {
        console.log(dataAdd)
    }, [dataAdd])

    useEffect(() => {
        console.log(listCustomerSelectedData)
        setDataAdd({
            ...dataAdd,
            customers: JSON.stringify(listCustomerSelected)
        })
        convert_table()
    }, [listCustomerSelected])

    const convert_table = async () => {
        console.log(listCustomer)
        console.log(listCurrentCustomer.length)
        console.log(listCustomerSelected.length)
        let newListCustomer = listCustomer.filter(item => {
            return !listCustomerSelected.includes(item._id)
        })
        setListCurrentCustomer(newListCustomer)
        let newListCustomerData = listCustomer.filter(item => {
            return listCustomerSelected.includes(item._id)
        })
        setListCustomerSelectedData(newListCustomerData)
    }

	const change_room = async (room_id) => {
		return setRoomSelected(room_id)
	}

    const change_customer_represent = async (customer_id) => {
		return setRepresent(customer_id)
	}

    const get_room_data = async () => {
        const res = await http_request({method: "GET", url:`cms/room/${roomSelected}`})
		const { code, data, message } = res
        console.log(data)
        if (code == 200) {
            setDataAdd({
                ...dataAdd,
                water_price: data.water_price,
                electric_price: data.electric_price,
                room_price: data.room_price,
                room: data._id
            })
            return setRoomData(data)
        }
    }

    const get_list_room_data = async () => {
        let input = {
            status: 1,
            apartment: apartmentCurent,
        }
        const res = await http_request({method: "GET", url:`cms/rooms`, params: input})
		const { code, data, message } = res
        if (code == 200) {
            return setListRoom(data.items)
        }
    }

    const get_list_customer = async (data_search) => {
        let input = {
            ...data_search,
            status: 1,
            apartment: apartmentCurent,
        }
        const res = await http_request({method: "GET", url:"cms/customers", params: input})
		const { code, data, message } = res
        if (code == 200) {
            setListCurrentCustomer(data.items)
            return data.items
        }
        return res
    }

    const onSubmit = async () => {
        // if (is_empty(dataAdd.name)) {
		// 	return setErrorForm({
		// 		"name": {
		// 			"error": true,
		// 			"message": "Không được để trống!"
		// 		}
		// 	})
		// }
        let input = {
            ...dataAdd,
            date_start: startDate,
            date_end: endDate,
            customer_represent: represent,
        }
        console.log(input)
		const res = await http_request({ method: "POST", url: "cms/contract/", data: input })
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
		return setDataAdd({
			...dataAdd,
			[type]: value
		})
	}

	const onChangeText = async (text = '') => {
        clearTimeout(timer.current)
        return new Promise(resolve => {
            timer.current = setTimeout(async () => resolve(search_text(text)), 350)
        })
    }

    const search_text = async (value) => {

		return get_list_customer({
			"q": trim(value),
		})
	}

	const render_action = (item) => {
        return (<div>
            <FaEdit title='Sửa' className='pointer-btn'
                // onClick={()=>open_detail(item)}
            />
        </div>)
	}
    const columns = [
		{ field: 'stt', headerName: 'STT', width: 20, align: "center",},
		{ field: 'fullname', headerName: 'Tên khách thuê', flex: 1 },
		{ field: 'phone', headerName: 'SĐT', flex: 1 },
        { field: 'action', headerName: 'Hành động', width: 100, align: "center",
        renderCell: (params) => (
            <div>
                {render_action(params.row)}
            </div>
        ),	
    },
	]

    return (<Fragment>
        <Modal 				
            isOpen={_modal}
            toggle={_toggleModal}
            className="modal-custom"
            size="xl"
        >
            <ModalHeader toggle={_toggleModal}>
                Thêm mới hợp đồng
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col md={6}>
                        <Label>
                            Chọn phòng tiến hành đăng ký hợp đồng
                        </Label>
                        <Input
                            id="exampleSelect"
                            name="select"
                            type="select"
                            className='btn-select pointer-btn'
                            value={roomSelected}
                            onChange={(e)=>change_room(e.target.value)}
                        >
                            {listRoom && listRoom.map((item) =>{
                            return (<option key={item._id} value={item._id} >{item.name}</option>)
                            })}
                        </Input>
                    </Col>
                    <Col md={6}>
                        
                    </Col>
                </Row>

                <TabContext value={tabSelected}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <TabList
                            aria-label="lab API tabs example"
                        >
                            <Tab label="1. Chọn khách thuê" value="1" index={1} onClick={() => selectTab("1")} />
                            <Tab label="2. Chọn dịch vụ" value="2" index={2} onClick={() => selectTab("2")} />
                        </TabList>
                    </Box>
                    <TabPanel index={1} key={"1"} value={"1"}>
                        <Row>
                            <Col md={6}>
                                <div style={{ height: 318, width: '100%' }}>
                                    <DataGrid 
                                        checkboxSelection 
                                        disableRowSelectionOnClick 
                                        getRowId={(row) => row._id}
                                        columns={columns}
                                        rows={listCurrentCustomer.map((item, index) => {
                                            return {
                                                ...item,
                                                stt: index + 1
                                            }
                                        })}
                                        keepNonExistentRowsSelected
                                        onRowSelectionModelChange={(newCustomer) => {
                                            setListCustomerSelected(newCustomer);
                                        }}
                                        rowSelectionModel={listCustomerSelected}
                                        components={{
                                            Footer: () => { return <div></div>},
                                            NoRowsOverlay: () => (
                                                <Stack height="100%" alignItems="center" justifyContent="center">
                                                    Dữ liệu khách thuê
                                                </Stack>
                                            ),
                                        }}
                                    />
                                </div>
                            </Col>
                            <Col md={6}>
                                <div style={{ height: 318, width: '100%' }}>
                                    <DataGrid 
                                        checkboxSelection 
                                        disableRowSelectionOnClick 
                                        getRowId={(row) => row._id}
                                        columns={columns}
                                        rows={listCustomerSelectedData.map((item, index) => {
                                            return {
                                                ...item,
                                                stt: index + 1
                                            }
                                        })}
                                        keepNonExistentRowsSelected
                                        onRowSelectionModelChange={(newCustomer) => {
                                            setListCustomerSelected(newCustomer);
                                        }}
                                        rowSelectionModel={listCustomerSelected}
                                        components={{
                                            Footer: () => { return <div></div>},
                                            NoRowsOverlay: () => (
                                                <Stack height="100%" alignItems="center" justifyContent="center">
                                                    Vui lòng chọn khách thuê
                                                </Stack>
                                            ),
                                        }}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <Row className='mt-3'>
                            <Col md={6}>
                                <Row>
                                    <Col md={3}>
                                        <Label>
                                            Tiền đặt cọc
                                        </Label>
                                    </Col>
                                    <Col md={9}>
                                        <FormGroup>
                                            <Input
                                                id="deposit_money"
                                                name="deposit_money"
                                                error={errorForm.deposit_money?.error}
                                                placeholder="Tiền đặt cọc"
                                                type="text"
                                                value={dataAdd.deposit_money}
                                                onChange={(e) =>
                                                    onChangeData("deposit_money", e.target.value, true)
                                                }
                                            />
                                            {errorForm.deposit_money?.error && <div className='text-error'>{errorForm.deposit_money?.message}</div>}
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={6}>
                                <Row>
                                    <Col md={3}>
                                        <Label>
                                            Chọn người đại diện
                                        </Label>
                                    </Col>
                                    <Col md={9}>
                                        <Input
                                            id="exampleSelect"
                                            name="select"
                                            type="select"
                                            className='btn-select pointer-btn'
                                            value={represent}
                                            onChange={(e)=>change_customer_represent(e.target.value)}
                                        >
                                            <option value="" disabled selected hidden>Chọn gười đại diện</option>
                                            {listCustomerSelectedData && listCustomerSelectedData.map((item) =>{
                                            return (<option key={item._id} value={item._id} >{item.fullname} - {item.phone}</option>)
                                            })}
                                        </Input>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className='mt-3'>
                            <Col md={6}>
                                <Row>
                                    <Col md={3}>
                                        <Label>
                                            Giá 1 số điện
                                        </Label>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Input
                                                id="electric_price"
                                                name="electric_price"
                                                error={errorForm.electric_price?.error}
                                                placeholder="Giá điện"
                                                type="text"
                                                value={dataAdd.electric_price}
                                                onChange={(e) =>
                                                    onChangeData("electric_price", e.target.value, true)
                                                }
                                            />
                                            {errorForm.electric_price?.error && <div className='text-error'>{errorForm.electric_price?.message}</div>}
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <Label>
                                            Giá 1 số nước
                                        </Label>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Input
                                                id="water_price"
                                                name="water_price"
                                                error={errorForm.water_price?.error}
                                                placeholder="Giá nước"
                                                type="text"
                                                value={dataAdd.water_price}
                                                onChange={(e) =>
                                                    onChangeData("water_price", e.target.value, true)
                                                }
                                            />
                                            {errorForm.water_price?.error && <div className='text-error'>{errorForm.water_price?.message}</div>}
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={6}>
                                <Row>
                                    <Col md={3}>
                                        <Label>
                                            Giá phòng
                                        </Label>
                                    </Col>
                                    <Col md={9}>
                                        <FormGroup>
                                            <Input
                                                id="room_price"
                                                name="room_price"
                                                error={errorForm.room_price?.error}
                                                placeholder="Giá phòng"
                                                type="text"
                                                value={dataAdd.room_price}
                                                onChange={(e) =>
                                                    onChangeData("room_price", e.target.value, true)
                                                }
                                            />
                                            {errorForm.room_price?.error && <div className='text-error'>{errorForm.room_price?.message}</div>}
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className='mt-3'>
                            <Col md={6}>
                                <Row>
                                    <Col md={2}>
                                        <Label>
                                            Ngày bắt đầu
                                        </Label>
                                    </Col>
                                    <Col md={4}>
                                        <DatePicker 
                                            selected={startDate} 
                                            onChange={(date) => setStartDate(date)} 
                                            placeholderText="Ngày bắt đầu"
                                            className="form-control"
                                            selectsStart
                                            isClearable
                                            maxDate={endDate || undefined}
                                            minDate={new Date()}
                                            dateFormat="dd/MM/yyyy"
                                            locale='vi'
                                        />
                                    </Col>
                                    <Col md={2}>
                                        <Label>
                                            Ngày kết thúc
                                        </Label>
                                    </Col>
                                    <Col md={4}>
                                        <DatePicker 
                                            selected={endDate} 
                                            onChange={(date) => setEndDate(date)} 
                                            placeholderText="Ngày kết thúc"
                                            className="form-control"
                                            selectsStart
                                            minDate={startDate || undefined}
                                            isClearable
                                            dateFormat="dd/MM/yyyy"
                                            locale='vi'
                                        />
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={6}>
                                <Row>
                                    <Col md={3}>
                                        <Label>
                                            Ghi chú
                                        </Label>
                                    </Col>
                                    <Col md={9}>
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
                                </Row>
                            </Col>
                        </Row>
                    </TabPanel>
                    <TabPanel index={2} key={"2"} value={"2"}>
                        
                    </TabPanel>
                </TabContext>
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

export default AddContract