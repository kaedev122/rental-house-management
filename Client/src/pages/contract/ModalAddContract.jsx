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
import { BsPersonCircle, BsLightningChargeFill, BsCloudLightning } from "react-icons/bs";
import { FaDollarSign, FaHandshakeSimple, FaHandshakeSimpleSlash } from "react-icons/fa6";
import "./contract.scss";
import { TextField, Button, } from '@mui/material';
import { useSnackbar } from 'notistack';
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Tab, Grid, Stack, Checkbox } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid';
import { FaEdit } from "react-icons/fa";
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import { vi } from 'date-fns/locale/vi';
registerLocale('vi', vi)
import "react-datepicker/dist/react-datepicker.css";
import ModalAddService from '../setting/ModalAddService'
import ModalDetailService from '../setting/ModalDetailService'
import ModalAddCustomer from '../customer/ModalAddCustomer'
import ModalDetailCustomer from '../customer/ModalDetailCustomer'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import makeAnimated from 'react-select/animated';
import AsyncSelect from 'react-select/async'
import { FaWindowClose } from "react-icons/fa";

const animatedComponents = makeAnimated();

const ModalAddContract = (props) => {
	const { _modal, _toggleModal, _done_action, _room_selected } = props;
    const timer = useRef()

	const apartmentCurrent = useSelector((state) => state.apartment?.current) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [listServiceSelectedData, setListServiceSelectedData] = useState([]);
    const [listService, setListService] = useState([])
    const [listRoom, setListRoom] = useState([])
    const [listRoomDefault, setListRoomDefault] = useState([])
    const [roomData, setRoomData] = useState({})
    const [roomSelected, setRoomSelected] = useState(_room_selected)
    const [represent, setRepresent] = useState()

    const [listCustomer, setListCustomer] = useState([])
    const [listCustomerDefault, setListCustomerDefault] = useState([])
    const [listCustomerSelected, setListCustomerSelected] = useState([]);

    const [dataAdd, setDataAdd] = useState({})
	const [errorForm, setErrorForm] = useState({})

    const [tabSelected, setTabSelected] = useState("1")
    const selectTab = (e) => {
        if (is_empty(roomSelected)) {
			return setErrorForm({
				"room_selected": {
					"error": true,
					"message": "Vui lòng chọn phòng trước!"
				}
			})
		}
        if (is_empty(dataAdd.water_price)) {
			return setErrorForm({
				"water_price": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (is_empty(dataAdd.electric_price)) {
			return setErrorForm({
				"electric_price": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (is_empty(dataAdd.room_price)) {
			return setErrorForm({
				"room_price": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (is_empty(dataAdd.start_water_number)) {
			return setErrorForm({
				"start_water_number": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (is_empty(dataAdd.start_electric_number)) {
			return setErrorForm({
				"start_electric_number": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (is_empty(represent)) {
			return setErrorForm({
				"represent": {
					"error": true,
					"message": "Vui lòng chọn người đại diện!"
				}
			})
		}
        const customer = listCustomerSelected.find(item => item._id == represent)
        if (is_empty(customer.phone)) {
			return setErrorForm({
				"represent": {
					"error": true,
					"message": "Người đại diện phải có SĐT!"
				}
			})
		}
        setTabSelected(e)
    }

    const [listServiceSelected, setListServiceSelected] = useState([]);

    const [startDate, setStartDate] = useState(new Date());
    const initialEndDate = new Date(startDate);
    initialEndDate.setFullYear(initialEndDate.getFullYear() + 1);
    const [endDate, setEndDate] = useState(initialEndDate);
    const [customerRow, setCustomerRow] = useState({});
    const [serviceRow, setServiceRow] = useState({});
    
    const [modalAddCustomer, setModalAddCustomer] = useState(false);
    const toggle_modal_add_customer = () => {
        return setModalAddCustomer(!modalAddCustomer)
    }

    const [modalAddService, setModalAddService] = useState(false);
    const toggle_modal_add_service = () => {
        return setModalAddService(!modalAddService)
    }

    const [modalDetailService, setModalDetailService] = useState(false);
    const toggle_modal_detail_service = () => {
        return setModalDetailService(!modalDetailService)
    }

    const [modalDetailCustomer, setModalDetailCustomer] = useState(false);
    const toggle_modal_detail_customer = () => {
        return setModalDetailCustomer(!modalDetailCustomer)
    }

    useEffect(() => {
        get_list_room_data()
        // get_list_customer()
        get_customer_data()
        get_list_service()
        get_default_data()
    }, [])

    useEffect(() => {
        if (roomSelected) {
            get_room_data(roomSelected)
        }
    }, [roomSelected])

    const get_customer_data = async () => {
        let result = await get_list_customer()
        setListCustomer(result)
    }

    const calc_total_price = () => {
        return listServiceSelectedData.reduce((total, item) => {
            return total + item.price * item.number
        }, 0)
    }

	const change_room = async (room_id) => {
        setErrorForm({})
        console.log(room_id)
		return setRoomSelected(room_id)
	}

    const change_customer_represent = async (customer_id) => {
        setErrorForm({})
		return setRepresent(customer_id)
	}

    const get_room_data = async () => {
        const res = await http_request({method: "GET", url:`cms/room/${roomSelected.value}`})
		const { code, data, message } = res
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
            apartment: apartmentCurrent,
        }
        const res = await http_request({method: "GET", url:`cms/rooms`, params: input})
		const { code, data, message } = res
        if (code == 200) {
            setListRoom(data.items)
            return data.items.map((item) => {
                return {
                    label: item.name,
                    value: item._id
                }
            })
        }
    }

    const get_default_data = async () => {
        let customerData = await get_list_customer()
        setListCustomerDefault(customerData)
        let roomData = await get_list_room_data()
        console.log(roomData)
        setListRoomDefault(roomData)
    }

    const get_list_customer = async (data_search) => {
        let input = {
            ...data_search,
            status: 1,
            apartment: apartmentCurrent,
        }
        const res = await http_request({method: "GET", url:"cms/customer/contract", params: input})
		const { code, data, message } = res
        if (code == 200) {
            let result = (data?.items || []).filter(item => {
                return listCustomerSelected.filter(i => i._id == item._id).length == 0
            })
            setListCustomer(result)
            return result
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

    const get_list_service = async () => {
        let input = {
            status: 1,
            apartment: apartmentCurrent
        }
        const res = await http_request({method: "GET", url:"cms/setting/services", params: input})
		const { code, data, message } = res
        if (code == 200) {
            setListService(data.items.map((item) => {
                return {
                    ...item,
                    number: 1
                }
            }))
            return true
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

	const done_action = () => {
		setModalAddCustomer(false)
        setModalAddService(false)
        setModalDetailCustomer(false)
        setModalDetailService(false)
        get_customer_data()
        get_list_room_data()
        get_list_service()
        return get_list_customer()
	}

    const onSubmit = async () => {
        const other_price = listServiceSelectedData.map(item => {
            return {
                service_id: item._id,
                name: item.name,
                price: item.price,
                number: parseInt(item.number)
            }
        })
        const customers = listCustomerSelected.map(item => {
            return item._id
        })
        let input = {
            ...dataAdd,
            date_start: startDate,
            date_end: endDate,
            customer_represent: represent,
            apartment: apartmentCurrent,
            other_price: JSON.stringify(other_price),
            customers: JSON.stringify(customers),
        }
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

    const search_text = async (value, type) => {
        if (type == 'room') {
            return get_list_room_data({
                "q": trim(value),
            })
        }
		return get_list_customer({
			"q": trim(value),
		})
	}

	const render_customer_action = (item) => {
        return (<div className='w-100 d-flex justify-content-between'>
            <FaEdit title='Sửa' className='pointer-btn me-3'
                onClick={()=>open_customer_detail(item)}
            />
            <FaWindowClose color="red" title='Bỏ' className='pointer-btn'
                onClick={()=> {
                    let newListCustomerData = listCustomerSelected.filter(i => i._id != item._id)
                    const check = newListCustomerData.filter(item => item._id == represent)
                    if (is_empty(check)) {
                        if (!is_empty(newListCustomerData)) {
                            setRepresent(newListCustomerData[0]._id)
                        } else {
                            setRepresent('')
                        }
                    }
                    setErrorForm({})
                    return setListCustomerSelected(newListCustomerData)
                }}
            />
        </div>)
	}

    const open_customer_detail = (item) => {
		toggle_modal_detail_customer()
        return setCustomerRow(item)
	}

    const open_service_detail = (item) => {
		toggle_modal_detail_service()
        return setServiceRow(item)
	}

    const columns_customer = [
		{ field: 'stt', headerName: 'STT', width: 20, align: "center",},
		{ field: 'fullname', headerName: 'Tên khách thuê', flex: 1 },
		{ field: 'phone', headerName: 'SĐT', flex: 1 },
		{ field: 'address', headerName: 'Địa chỉ', flex: 1 },
        { field: 'action', headerName: 'Hành động', width: 100, align: "center",
            renderCell: (params) => (
                <div>
                    {render_customer_action(params.row)}
                </div>
            ),	
        },
	]

    const render_service = () => {
        return listService.map((item, index) => {
            const isItemSelected = isSelected(item._id);
            
            return (<TableRow key={item._id} item={item} index={index} sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell align="left">
                    <Checkbox
                        onClick={(event) => handleClick(event, item._id)} 
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                            'aria-labelledby': `${item._id}`,
                        }}
                    />
                </TableCell>
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
                        disabled={!isItemSelected}
                        className="form-control text-center"
                        placeholder="SL"
                        value={(item?.price || 0).toLocaleString()}
                        min={0}
                        onChange={(e) => onChangeDataPrice(e.target.value, index)}
                    />
                </TableCell>
                <TableCell align="left">
                    <Input
                        id="number"
                        name="number"
                        type="text"
                        className="form-control text-center"
                        placeholder="SL"
                        value={item.number}
                        onChange={(e) => onChangeDataNumber(e.target.value, index)}
                        onBlur={(e) => {
                            const newValue = (e.target.value == '' || e.target.value == '0') ? '1' : e.target.value;
                            onChangeDataNumber(newValue, index);
                        }}
                        min={1}
                    />
                </TableCell>                
                <TableCell width="100" align="left">
                    {render_service_action(item)}
                </TableCell>
            </TableRow>)
        })
    }

    const onChangeDataPrice = (value, index) => {
        if (is_empty(value)) {
            let list = [...listService]
            list[index].price = 0;
            return setListService(list)
        }
        const result = value.replace(/\D/g, "");
        let list = [...listService]
        list[index].price = parseInt(result);
        setListService(list)
    };

	const render_service_action = (item) => {
        return (<div>
            <FaEdit title='Sửa' className='pointer-btn'
                onClick={()=>open_service_detail(item)}
            />
        </div>)
	}

    const isSelected = (id) => {
        return listServiceSelected.indexOf(id) !== -1;
    }

    const onChangeDataNumber = async (value, index) => {
        value = value.replace(/[^0-9.]/g, '')
        const regex = /^\d+$/;
        let list = [...listService]
        if (regex.test(value) || value === '') {
            list[index].number = value
        } else {
            value = list[index].number
        }
        return setListService(list)
    };

    useEffect(() => {
        console.log(listServiceSelected)
        setListServiceSelectedData(listService.filter(item => {
            return listServiceSelected.includes(item._id)
        }))
        console.log(listServiceSelectedData)
    }, [listServiceSelected])
    
    const handleClick = (event, id) => {
        const selectedIndex = listServiceSelected.indexOf(id);
        let newSelected = [];
        if (selectedIndex === -1) {
            newSelected = newSelected.concat(listServiceSelected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(listServiceSelected.slice(1));
        } else if (selectedIndex === listServiceSelected.length - 1) {
            newSelected = newSelected.concat(listServiceSelected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                listServiceSelected.slice(0, selectedIndex),
                listServiceSelected.slice(selectedIndex + 1),
            );
        }
        setListServiceSelected(newSelected);
    };

    const handle_change = (item) => {
        console.log(item)
        let test = listCustomerSelected.filter(i => i._id == item._id).length > 0
        console.log(test)
        if (!test) {
            return setListCustomerSelected(listCustomerSelected.concat(item))
        }
    }

    const formatOptionLabel = (option) => {
        return <div className="d-flex item-option">
            <span>{option.fullname} - {option.phone}</span>
        </div>
    }

    const formatRoomOptionLabel = (option) => {
        console.log(option)
        return <div className="d-flex item-option">
            <span>{option.label}</span>
        </div>
    }
    
    const promiseOptions = async (text = '') => {
        clearTimeout(timer.current)
        return new Promise(resolve => {
            timer.current = setTimeout(async () => resolve(search_text(text, "customer")), 500)
        })
    }

    const promiseRoomOptions = async (text = '') => {
        clearTimeout(timer.current)
        return new Promise(resolve => {
            timer.current = setTimeout(async () => resolve(search_text(text, "room")), 500)
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
                Thêm mới hợp đồng
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col md={8}>
                        <Label>
                            Chọn phòng tiến hành đăng ký hợp đồng
                        </Label>
                        <AsyncSelect
                            placeholder={'Tìm kiếm phòng theo tên phòng'}
                            cacheOptions
                            defaultOptions={listRoomDefault}
                            options={listRoom}
                            loadOptions={promiseRoomOptions}
                            onChange={(e)=>change_room(e)}
                            value={roomSelected}
                            formatOptionLabel={formatRoomOptionLabel}
                            components={{
                                ...animatedComponents,
                                LoadingMessage: () => <div className="no-option">Đang tìm kiếm...</div>,
                                NoOptionsMessage: () => <div className="no-option">Không tìm thấy kết quả!</div>,
                            }}
                        />
                        {/* <Input
                            id="exampleSelect"
                            name="select"
                            type="select"
                            className='btn-select pointer-btn'
                            disabled={_room_selected}
                            value={roomSelected}
                            onChange={(e)=>change_room(e.target.value)}
                        >
                            <option value="" disabled selected hidden>Chọn phòng</option>
                            {listRoom && listRoom.map((item) =>{
                                return (<option key={item?._id} value={item?._id} >{item?.name}</option>)
                            })}
                        </Input> */}
                        {errorForm.room_selected?.error && <div className='text-error'>{errorForm.room_selected?.message}</div>}
                    </Col>
                    <Col md={4}>
                        
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
                        <div className='d-flex align-items-center w-100'>
                            <span className='fs-6 me-2'>Chọn khách thuê</span>
                            <Button
                                onClick={() => toggle_modal_add_customer()}
                                variant='contained'
                                endIcon={<AddIcon />} 
                                size="small"
                            >
                                Thêm mới khách
                            </Button>
                        </div>
                        <Row className='mt-2'>
                            <AsyncSelect
                                placeholder={'Tìm kiếm khách bằng số điện thoại hoặc tên'}
                                value={null}
                                cacheOptions
                                defaultOptions={listCustomerDefault.filter(item => {
                                    return !listCustomerSelected.some(i => i._id == item._id)
                                })}
                                options={listCustomer}
                                loadOptions={promiseOptions}
                                onChange={handle_change}
                                formatOptionLabel={formatOptionLabel}
                                closeMenuOnSelect={false}
                                components={{
                                    ...animatedComponents,
                                    DropdownIndicator: () => null,
                                    LoadingMessage: () => <div className="no-option">Đang tìm kiếm...</div>,
                                    NoOptionsMessage: () => <div className="no-option">Không tìm thấy kết quả!</div>,
                                }}
                            />
                        </Row>
                        <Row className='mt-2'>
                            <div style={{ height: 318, width: '100%' }}>
                                <DataGrid 
                                    getRowId={(row) => row._id}
                                    columns={columns_customer}
                                    rows={listCustomerSelected.map((item, index) => {
                                        return {
                                            ...item,
                                            stt: index + 1
                                        }
                                    })}
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
                                                value={dataAdd.deposit_money ? dataAdd.deposit_money.toLocaleString() : ""}
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
                                            <option value="" disabled selected hidden>Chọn người đại diện</option>
                                            {listCustomerSelected && listCustomerSelected.map((item) =>{
                                                return (<option key={item?._id} value={item?._id} >{item?.fullname} - {item?.phone || "---"}</option>)
                                            })}
                                        </Input>
                                        {errorForm.represent?.error && <div className='text-error'>{errorForm.represent?.message}</div>}
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className='mt-3'>
                            <Col md={6}>
                                <Row>
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
                                                value={dataAdd.water_price ? dataAdd.water_price.toLocaleString() : ""}
                                                onChange={(e) =>
                                                    onChangeData("water_price", e.target.value, true)
                                                }
                                            />
                                            {errorForm.water_price?.error && <div className='text-error'>{errorForm.water_price?.message}</div>}
                                        </FormGroup>
                                    </Col>
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
                                                value={dataAdd.electric_price ? dataAdd.electric_price.toLocaleString() : ""}
                                                onChange={(e) =>
                                                    onChangeData("electric_price", e.target.value, true)
                                                }
                                            />
                                            {errorForm.electric_price?.error && <div className='text-error'>{errorForm.electric_price?.message}</div>}
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
                                                value={dataAdd.room_price ? dataAdd.room_price.toLocaleString() : ''}
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
                                    <Col md={3}>
                                        <Label>
                                            Số nước đầu vào
                                        </Label>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Input
                                                id="start_water_number"
                                                name="start_water_number"
                                                error={errorForm.start_water_number?.error}
                                                placeholder="Số nước"
                                                type="text"
                                                value={dataAdd.start_water_number}
                                                onChange={(e) =>
                                                    onChangeData("start_water_number", e.target.value, true)
                                                }
                                            />
                                            {errorForm.start_water_number?.error && <div className='text-error'>{errorForm.start_water_number?.message}</div>}
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <Label>
                                            Số điện đầu vào
                                        </Label>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Input
                                                id="start_electric_number"
                                                name="start_electric_number"
                                                error={errorForm.start_electric_number?.error}
                                                placeholder="Số điện"
                                                type="text"
                                                value={dataAdd.start_electric_number}
                                                onChange={(e) =>
                                                    onChangeData("start_electric_number", e.target.value, true)
                                                }
                                            />
                                            {errorForm.start_electric_number?.error && <div className='text-error'>{errorForm.start_electric_number?.message}</div>}
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={6}>
                                <Row>
                                    <Col md={2}>
                                        <Label>
                                            Ngày bắt đầu HĐ
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
                                            dateFormat="dd/MM/yyyy"
                                            locale='vi'
                                        />
                                    </Col>
                                    <Col md={2}>
                                        <Label>
                                            Ngày kết thúc HĐ
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
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Row>
                                    <Col md={12}>
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
                        <Row>
                            <Col md={12}>
                            <Row>
                                <div>
                                    <Label>Danh sách dịch vụ</Label>
                                    <Button
                                        onClick={() => toggle_modal_add_service()}                                    
                                        endIcon={<AddIcon />} 
                                        size="small"
                                    >
                                        Thêm mới
                                    </Button>
                                </div>
                            </Row>
                            <TableContainer style={{ width: '100%', height: "400px" }} component={Paper}>
                                <Table stickyHeader aria-label="collapsible table">
                                    <TableHead>
                                    <TableRow style={{backgroundColor:'white'}}>
                                        <TableCell width="100" align="left">
                                            Chọn
                                        </TableCell>
                                        <TableCell width="100" align="left">
                                            STT
                                        </TableCell>
                                        <TableCell align="left">
                                            Tên dịch vụ
                                        </TableCell>
                                        <TableCell width="150" align="left">
                                            Giá tiền
                                        </TableCell>
                                        <TableCell width="100" align="left">
                                            Số lượng
                                        </TableCell>
                                        <TableCell width="100" align="left">
                                            Hành động
                                        </TableCell>
                                    </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {render_service()}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            </Col>
                            <Col md={9}>

                            </Col>
                            <Col md={3}>
                                <span>Tổng cộng: {calc_total_price().toLocaleString()} đ</span>
                            </Col>
                        </Row>
                    </TabPanel>
                </TabContext>
            </ModalBody>
            <ModalFooter>
                <Button className="btn-custom cancel" onClick={_toggleModal}>
                    Hủy bỏ
                </Button>
                {tabSelected == "1" ? <Button
                    className="btn-custom save"
                    variant="contained"
                    onClick={() => selectTab("2")}
                >Tiếp theo</Button> : <Button
                    className="btn-custom save"
                    variant="contained"
                    onClick={onSubmit}
                >Lưu</Button>}
            </ModalFooter>
        </Modal>

        {modalAddCustomer && <ModalAddCustomer
            _modal={modalAddCustomer}
            _toggleModal={toggle_modal_add_customer}
            _done_action={done_action}
        />}

        {modalAddService && <ModalAddService
            _modal={modalAddService}
            _toggleModal={toggle_modal_add_service}
            _done_action={done_action}
        />}

        {modalDetailCustomer && <ModalDetailCustomer
            _modal={modalDetailCustomer}
            _toggleModal={toggle_modal_detail_customer}
            _done_action={done_action}
            _dataSelect={customerRow}
        />}

        {modalDetailService && <ModalDetailService
            _modal={modalDetailService}
            _toggleModal={toggle_modal_detail_service}
            _done_action={done_action}
            _dataSelect={serviceRow}
        />}
    </Fragment>)
}

export default ModalAddContract