import React, { Fragment, useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Col, Row, Modal, ModalHeader, UncontrolledDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap'
import { http_request, get_local_storage, is_empty, trim } from '@utils'
import { format_date_time } from '@utils/format_time'
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FaBed, FaPhoneAlt, FaMoneyBillWaveAlt, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { IoPerson, IoPeopleSharp, IoWaterSharp } from "react-icons/io5";
import { RiWaterFlashFill } from "react-icons/ri";
import { BsPersonCircle, BsLightningChargeFill } from "react-icons/bs";
import { FaDollarSign, FaHandshakeSimple, FaHandshakeSimpleSlash, FaDoorClosed } from "react-icons/fa6";
import { TextField, Button, } from '@mui/material';
import { MdOutlineSensorDoor } from "react-icons/md";
import ModalAddBill from './ModalAddBill';
import ModalDetailBill from './ModalDetailBill';
import ModalPayBill from './ModalPayBill';
import "./bill.scss";
import { useSnackbar } from 'notistack';
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Tab, Grid, Stack } from '@mui/material'
import Select from 'react-select'
import { DataGrid } from '@mui/x-data-grid';
import { FaEdit } from "react-icons/fa";
import { format_full_time } from '@utils/format_time';
import { Paginations, SearchBar } from "@components"
import AddIcon from '@mui/icons-material/Add';

const ListBill = () => {
	const apartmentCurrent = useSelector((state) => state.apartment?.current) || get_local_storage("apartment", "")
	const timer = useRef()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [sort, setSort] = useState(false)
    const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
    const [dataTable, setDataTable] = useState([]);
	const [totalRecord, setTotalRecord] = useState(0);
	const [totalPages, setTotalPage] = useState(0);

    const [dataAdd, setDataAdd] = useState({})
    const [dataSelect, setDataSelect] = useState({})
    const [dataSearch, setDataSearch] = useState({
        apartment: apartmentCurrent,
	});
    const [modalAdd, setModalAdd] = useState(false);
    const toggle_modal_add = () => {
        return setModalAdd(!modalAdd)
    }

    const [modalDetail, setModalDetail] = useState(false);
    const toggle_modal_detail = () => {
        return setModalDetail(!modalDetail)
    }

    const [modalPay, setModalPay] = useState(false);
    const toggle_modal_pay = () => {
        return setModalPay(!modalPay)
    }
    
	const list_status = [
        {
			'text': 'Mở',
			'value': 1,
		},{
			'text': 'Đóng',
			'value': 0,
		},{
			'text': 'Tất cả',
			'value': ""
		}
	]

	const list_payment_status = [
        {
			'text': 'Chưa thanh toán',
			'value': 0,
		},{
			'text': 'Thanh toán một phần',
			'value': 1,
		},{
			'text': 'Đã thanh toán',
			'value': 2,
		},{
			'text': 'Tất cả',
			'value': ""
		}
	]

    useEffect(() => {
        if (apartmentCurrent) {
            get_list_contract({
                ...dataSearch,
                "apartment": apartmentCurrent,
                "page": page,
                "limit": size,
                "sort": sort || 'false'
            })
        }
    }, [apartmentCurrent, sort])

    const search_table = (data_search) => {
		setSize(data_search.limit || size)
		setPage(data_search.page)
		return search_data_input(data_search)
	}

	const search_data_input = async (data_input) => {
		setDataSearch(data_input)
		return await get_list_contract(data_input)
	}

    const search_type = async (type, value) => {
		setPage(1)
		return search_data_input({
			...dataSearch,
			[type]: value,
			"page": 1
		})
	}

	const render_payment_selected = (list_select, selected) => {
        if (selected == "") return "Tất cả"
		const new_list = list_select.filter(item => item.value == selected)
		if (is_empty(new_list)) {
			return "Trạng thái thanh toán"
		}
		return new_list[0]?.text
	}

    const render_status_selected = (list_select, selected) => {
        if (selected == "") return "Tất cả"
		const new_list = list_select.filter(item => item.value == selected)
		if (is_empty(new_list)) {
			return "Trạng thái"
		}
		return new_list[0]?.text
	}

    const get_list_contract = async (dataInput) => {
        let input = {
            ...dataInput,
            "limit": size
        }
        const res = await http_request({method: "GET", url:"cms/bills", params: input})
		const { code, data, message } = res
        if (code == 200) {
            setDataTable(data.items)
            setDataAdd(data)
            setTotalRecord(data.total)
            setTotalPage(data.totalPages)
            return true
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

	const open_detail = async (item) => {
        console.log(item)
        setDataSelect(item)
        return toggle_modal_detail()
	}

	const open_pay = async (item) => {
        console.log(item)
        setDataSelect(item)
        return toggle_modal_pay()
	}

	const done_action = () => {
		setModalAdd(false)
		setModalDetail(false)
		setModalPay(false)
        return get_list_contract({
            ...dataSearch,
			"apartment": apartmentCurrent,
			"page": 1,
            "limit": size
        })
	}

	const render_action = (item) => {
        return (<div>
            <FaEdit title='Sửa' className='pointer-btn'
                onClick={()=>open_detail(item)}
            />
        </div>)
	}

	const render_status = (status) => {
		if (status === 1) return <Button className='btn-status' color='success' size='sm'>Mở</Button>
		return <Button className='btn-status' color='error' size='sm'>Đóng</Button>
	}

    const render_payment_status = (status) => {
		if (status === 0) return <Button className='btn-status' color='error' size='sm'>Chưa thanh toán</Button>
		if (status === 1) return <Button className='btn-status' color='warning' size='sm'>Thanh toán một phần</Button>
		return <Button className='btn-status' color='success' size='sm'>Đã thanh toán</Button>
	}

	const onChangeText = async (text = '') => {
		clearTimeout(timer.current)
		return new Promise(resolve => {
			timer.current = setTimeout(async () => resolve(search_text(text)), 350)
		})
	}

    const search_text = async (value) => {
		setPage(1)
		return search_data_input({
			...dataSearch,
			"q": trim(value),
			"page": 1
		})
	}

    const columns = [
		{ field: 'stt', headerName: 'STT', width: 20, align: "center",},
		{ field: 'code', headerName: 'Mã hóa đơn', width: 100, flex: 1 },
		{ field: 'name', headerName: 'Phòng', flex: 1,
            valueGetter: (params) => `${params.row.room.name}`
        },
		{ field: 'contract', headerName: 'Hợp đồng', flex: 1,            
            valueGetter: (params) => `${params.row.contract.code}`
        },		
        { field: 'water_number', headerName: 'Số nước cuối', width: 100, flex: 1, },
		{ field: 'electric_number', headerName: 'Số điện cuối', width: 100, flex: 1 },
		{ field: 'total', headerName: 'Tổng tiền', width: 100, flex: 1, 
            valueGetter: (params) => `${params.row.total.toLocaleString()} đ` 
        },
        { field: 'createdAt', headerName: 'Ngày tạo', width: 200, align: "center", 
            valueGetter: (params) => `${format_date_time(params.row.createdAt)}`
        },
		{ field: 'status', headerName: 'Trạng thái', width: 200, align: "center",
            renderCell: (params) => (
                <div>
                    {render_status(params.row.status)}
                </div>
            ),	
        },
        { field: 'payment_status', headerName: 'Thanh toán', width: 200, align: "center",
            renderCell: (params) => (
                <div
                    onClick={() => open_pay(params.row)}
                >
                    {render_payment_status(params.row.payment_status)}
                </div>
            ),	
        },
        { field: 'action', headerName: 'Hành động', width: 100, align: "center",
            renderCell: (params) => (
                <div>
                    {render_action(params.row)}
                </div>
            ),	
        },
	]

    return (<div id="main-content">
        <Card>
            <CardHeader>
                <div className='d-flex justify-content-between align-items-center'>
                    <div>
                        <span className='header-text'>Quản lý hóa đơn</span>

                    </div>
                    <div className='float-end'>
                        <Button
                            onClick={() => toggle_modal_add()}
                            disabled={!apartmentCurrent}
                            className=''                            
                            variant="contained"
                            endIcon={<AddIcon />}
                        >
                            Thêm mới
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardBody>
                <div className='group-container'>
                    <div className='search-bar d-flex align-items-center w-100 justify-content-between'>
                        <SearchBar
                            placeholder={"Tìm kiếm theo mã hóa đơn, mã hợp đồng, tên phòng"}
                            onChangeText={onChangeText}
                        />
                        <div className='d-flex float-end'>
                            <UncontrolledDropdown
                                className="me-2 "
                                direction="down"
                            >
                                <DropdownToggle
                                    className='filter-select h-100'
                                    caret
                                    color='secondary' 
                                    outline
                                >
                                    {render_status_selected(list_status, dataSearch.status)}
                                </DropdownToggle>
                                <DropdownMenu>
                                    {list_status && list_status.map((item, index) => (
                                        <DropdownItem key={index} value={item.value} onClick={e => search_type("status", e.target.value)}>
                                            {item.text}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </UncontrolledDropdown>
                            <UncontrolledDropdown
                                className="me-2 "
                                direction="down"
                            >
                                <DropdownToggle
                                    className='filter-select h-100'
                                    caret                                    
                                    color='secondary' 
                                    outline
                                >
                                    {render_payment_selected(list_payment_status, dataSearch.payment_status)}
                                </DropdownToggle>
                                <DropdownMenu>
                                    {list_payment_status && list_payment_status.map((item, index) => (
                                        <DropdownItem key={index} value={item.value} onClick={e => search_type("payment_status", e.target.value)}>
                                            {item.text}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </div>
                    </div>
                    <div className='table-list' style={{ height: "578px", width: '100%' }}>
                        <DataGrid 
                            getRowId={(row) => row._id}
                            columns={columns}
                            rows={dataTable.map((item, index) => {
                                return {
                                    ...item,
                                    stt: index + 1
                                }
                            })}
                            components={{
                                Footer: () => { return <div></div>},
                                NoRowsOverlay: () => (
                                    <Stack height="100%" alignItems="center" justifyContent="center">
                                        Hóa đơn
                                    </Stack>
                                ),
                            }}
                        />
                    </div>
                </div>
            </CardBody>
            <CardFooter>
                {/* <span className='float-end'>Tổng cộng: {dataAdd.total}</span> */}
                <Paginations
                    configs={{
                        'current_page': page, // Trang hiện tại
                        'total_record': totalRecord, // Tổng số record
                        'total_page': totalPages, // Tổng số record
                        'limit': size, // số record mỗi trang\
                    }}
                    show_pagi={true}
                    dataSearch={dataSearch}
                    search_data={(data) => search_table(data)}
                />
            </CardFooter>
        </Card>

        {modalAdd && <ModalAddBill
            _modal={modalAdd}
            _toggleModal={toggle_modal_add}
            _done_action={done_action}
        />}

        {modalDetail && <ModalDetailBill
            _modal={modalDetail}
            _toggleModal={toggle_modal_detail}
            _done_action={done_action}
            _dataSelect={dataSelect}
        />}

        {modalPay && <ModalPayBill
            _modal={modalPay}
            _toggleModal={toggle_modal_pay}
            _done_action={done_action}
            _dataSelect={dataSelect}
        />}
    </div>)
}

export default ListBill