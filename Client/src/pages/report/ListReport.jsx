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
import "./revenue.scss";
import { useSnackbar } from 'notistack';
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Tab, Grid, Stack } from '@mui/material'
import Select from 'react-select'
import { DataGrid } from '@mui/x-data-grid';
import { FaEdit } from "react-icons/fa";
import { format_full_time } from '@utils/format_time';
import { Paginations, SearchBar } from "@components"

const ListRevenue = () => {
	const apartmentCurrent = useSelector((state) => state.apartment?.curent) || get_local_storage("apartment", "")
	const timer = useRef()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [sort, setSort] = useState(false)
    const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
    const [dataTable, setDataTable] = useState([]);
	const [totalRecord, setTotalRecord] = useState(0);
	const [totalPages, setTotalPage] = useState(0);

    const [dataAdd, setDataAdd] = useState({})
    const [totalRevenue, setTotalRevenue] = useState({})
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
			'text': 'Tất cả',
			'value': ""
		},{
			'text': 'Mở',
			'value': 1,
		},{
			'text': 'Đóng',
			'value': 0,
		}
	]

	const list_payment_status = [
        {
			'text': 'Tất cả',
			'value': ""
		},{
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
            get_list_revenue({
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
		return await get_list_revenue(data_input)
	}

    const search_type = async (type, value) => {
		setPage(1)
		return search_data_input({
			...dataSearch,
			[type]: value,
			"page": 1
		})
	}

	const render_selected = (list_select, selected) => {
		const new_list = list_select.filter(item => item.value == selected)
		if (is_empty(new_list)) {
			return list_select[0]?.text
		}
		return new_list[0]?.text
	}
    const get_list_revenue = async (dataInput) => {
        let input = {
            ...dataInput,
            "limit": size
        }

        const res = await http_request({method: "GET", url:"cms/revenues", params: input})
		const { code, data, message } = res
        if (code == 200) {
            console.log(data)
            setDataTable(data.items)
            setDataAdd(data)
            setTotalRecord(data.total)
            setTotalPage(data.totalPages)
            return get_total_revenue()
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

    const get_total_revenue = async () => {
        let input = {
            apartment: apartmentCurrent
        }
        const res = await http_request({method: "GET", url:"cms/revenue-total", params: input})
		const { code, data, message } = res
        if (code == 200) {
            return setTotalRevenue(data)
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
        return get_list_revenue({
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
		{ field: 'bill', headerName: 'Hóa đơn', flex: 1,
            valueGetter: (params) => `${params.row.bill.code}`
        },
		{ field: 'contract', headerName: 'Hợp đồng', flex: 1,            
            valueGetter: (params) => `${params.row.contract.code}`
        },		
		{ field: 'money', headerName: 'Số tiền', width: 100, flex: 1 },
        { field: 'createdAt', headerName: 'Ngày thu', width: 100, flex: 1, 
            renderCell: (params) => (
                <div>
                    {format_full_time(params.row.createdAt)}
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
                        <Button
                            onClick={() => toggle_modal_add()}
                            disabled={!apartmentCurrent}
                            className=''
                        >
                            Thêm mới +
                        </Button>
                    </div>
                    <div className='float-end'>

                    </div>
                </div>
            </CardHeader>
            <CardBody>
                <div className='group-container'>
                    <div className='d-flex align-items-center'>
                        <SearchBar
                            placeholder={"Tìm kiếm theo mã hóa đơn"}
                            onChangeText={onChangeText}
                        />
                        <UncontrolledDropdown
							className="me-2 "
							direction="down"
						>
							<DropdownToggle
								className='filter-select h-100'
								caret
							>
								{render_selected(list_status, dataSearch.status)}
							</DropdownToggle>
							<DropdownMenu>
								{list_status && list_status.map((item, index) => (
									<DropdownItem key={index} color='red' value={item.value} onClick={e => search_type("status", e.target.value)}>
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
							>
								{render_selected(list_payment_status, dataSearch.payment_status)}
							</DropdownToggle>
							<DropdownMenu>
								{list_payment_status && list_payment_status.map((item, index) => (
									<DropdownItem key={index} color='red' value={item.value} onClick={e => search_type("payment_status", e.target.value)}>
										{item.text}
									</DropdownItem>
								))}
							</DropdownMenu>
						</UncontrolledDropdown>
                    </div>
                    <div className='mt-3' style={{ height: "578px", width: '100%' }}>
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
                                        Dịch vụ
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
    </div>)
}

export default ListRevenue