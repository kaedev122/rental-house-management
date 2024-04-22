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
import "./home.scss";
import { useSnackbar } from 'notistack';
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Tab, Grid, Stack } from '@mui/material'
import Select from 'react-select'
import { DataGrid } from '@mui/x-data-grid';
import { FaEdit } from "react-icons/fa";
import { Paginations, SearchBar } from "@components"
import DatePicker, { registerLocale } from "react-datepicker"
import viLocale from 'date-fns/locale/vi'
registerLocale('vi', viLocale)
import 'react-datepicker/dist/react-datepicker.css'
import { ModalDialog } from '@components'
import { FaLockOpen } from "react-icons/fa";
import { FaLock } from "react-icons/fa";

const Home = () => {
	const timer = useRef()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
    const [dataTable, setDataTable] = useState([]);
	const [totalRecord, setTotalRecord] = useState(0);
	const [totalPages, setTotalPage] = useState(0);
    const [dataStatus, setDataStatus] = useState({})

    const [dataAdd, setDataAdd] = useState({})
    const [dataSelect, setDataSelect] = useState({})
    const [dataSearch, setDataSearch] = useState({});
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
    const [openDialog, setOpenDialog] = useState(false)
	const list_status = [
        {
			'text': 'Tất cả',
			'value': ""
		},{
			'text': 'Hoạt động',
			'value': 1,
		},{
			'text': 'Khóa',
			'value': -1,
		},{
			'text': 'Chưa kích hoạt',
			'value': 0,
		}
	]

    useEffect(() => {
        get_list_user({
            ...dataSearch,
            "page": page,
            "limit": size,
        })
    }, [])

    const search_table = (data_search) => {
		setSize(data_search.limit || size)
		setPage(data_search.page)
		return search_data_input(data_search)
	}

	const search_data_input = async (data_input) => {
		setDataSearch(data_input)
		return await get_list_user(data_input)
	}

    const get_list_user = async (dataInput) => {
        let input = {
            ...dataInput,
            "limit": size
        }
        const res = await http_request({method: "GET", url:"admin/users", params: input})
		const { code, data, message } = res
        if (code == 200) {
            setDataAdd(data)
            setTotalRecord(data.total)
            setTotalPage(data.totalPages)
            return setDataTable(data.items)
        }
        return enqueueSnackbar("Có lỗi đã xảy ra", {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

    const changeStatus = async (status) => {
        let input = {
            status: status
        }
		const res = await http_request({ method: "PUT", url: `admin/user/${dataSelect._id}`, data: input })
		const { code, data, message } = res
        if (is_empty(res)) {
            return enqueueSnackbar("Có lỗi đã xảy ra!", {
                variant: "error",
                autoHideDuration: 5000,
            })
		}
        if (code === 200) {
            enqueueSnackbar(status ? "Mở khóa thành công" : "Ngưng hoạt động thành công", {
                variant: "success",
                autoHideDuration: 5000,
            })
            return done_action()
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

    const done_action = () => {
        setOpenDialog(false)
        return get_list_user({
            ...dataSearch,
            "page": page,
            "limit": size,
        })
    
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
    
    const render_time_select = () => {
		return <div className='d-flex ms-2'>
			{format_date_time(dataSearch.createdFrom)} - {format_date_time(dataSearch.createdTo)}
		</div>
	}

	const search_data_table = async (type, value) => {
		setDataSearch({
			...dataSearch,
			[type]: value,
		})
		return await get_list_user({
			...dataSearch,
			[type]: value,
		})
	}

	const render_action = (item) => {
        return ( item.status == -1 ? <div>
            <FaLockOpen title='Mở khóa' className='pointer-btn'
                onClick={()=>open_detail(item)}
            />
        </div> : <div>
            <FaLock title='Khóa' className='pointer-btn'
                onClick={()=>open_detail(item)}
            />
        </div>)
	}

	const open_detail = (item) => {
		setOpenDialog(true)
        setDataStatus(item.status == -1 ? {
            status: 1,
            title: 'Mở khóa',
            message: 'Bạn có muốn mở khóa?'
        }: {
            status: -1,
            title: 'Khóa',
            message: 'Bạn có muốn khóa?'
        })
        return setDataSelect(item)
	}
    
	const render_status = (status) => {
		if (status === 1) return <Button className='btn-status' color='success' size='sm'>Hoạt động</Button>
		if (status === 0) return <Button className='btn-status' color='warning' size='sm'>Chưa kích hoạt</Button>
		return <Button className='btn-status' color='error' size='sm'>Khóa</Button>
	}

    const columns = [
		{ field: 'stt', headerName: 'STT', width: 20, align: "center",},
		{ field: 'username', headerName: 'Tên tài khoản', flex: 1,
            valueGetter: (params) => `${params.row.username}`
        },
        { field: 'fullname', headerName: 'Tên người dùng', flex: 1,
            valueGetter: (params) => `${params.row.fullname}`
        },
		{ field: 'email', headerName: 'Email', flex: 1,            
            valueGetter: (params) => `${params.row.email}`
        },		
        { field: 'phone', headerName: 'SĐT', width: 100, flex: 1, 
            valueGetter: (params) => `${params.row.phone}`},
        { field: 'createdAt', headerName: 'Ngày tạo', width: 100, flex: 1, 
            renderCell: (params) => (
                <div>
                    {format_date_time(params.row.createdAt)}
                </div>
            ),	
        },{ field: 'status', headerName: 'Trạng thái', flex: 1,
            renderCell: (params) => (
                <div>
                    {render_status(params.row.status)}
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

    const render_status_selected = (list_select, selected) => {
        if (selected == "") return "Tất cả"
		const new_list = list_select.filter(item => item.value == selected)
		if (is_empty(new_list)) {
			return "Trạng thái"
		}
		return new_list[0]?.text
	}

    const search_type = async (type, value) => {
		setPage(1)
		return search_data_input({
			...dataSearch,
			[type]: value,
			"page": 1
		})
	}

    return (<div id="main-content">
        <Card>
            <CardHeader>
                <div className='d-flex justify-content-between align-items-center'>
                    <div>
                        <span className='header-text'>Quản lý người dùng</span>
                    </div>
                    <div className='float-end'>

                    </div>
                </div>
            </CardHeader>
            <CardBody>
                <div className='group-container'>
                    <div className='search-bar d-flex align-items-center w-100 justify-content-between'>
                        <SearchBar
                            placeholder={"Tìm kiếm theo tên, số điện thoại, email..."}
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
                                direction="start"
                                className='ms-2'
                            >
                                <DropdownToggle
                                    className='filter-select-date d-flex'
                                    caret
                                    color='secondary' 
                                    outline
                                >
                                    Ngày tạo: {render_time_select()}
                                </DropdownToggle>
                                <DropdownMenu>
                                    <div className='div-date-search'>
                                        <DatePicker
                                            placeholderText="Từ ngày"
                                            selected={dataSearch.createdFrom}
                                            onChange={date => search_data_table("createdFrom", date)}
                                            isClearable
                                            dateFormat="dd/MM/yyyy"
                                            maxDate={dataSearch.createdTo || new Date()}
                                            locale='vi'
                                        />
                                        <DatePicker
                                            placeholderText="Đến ngày"
                                            selected={dataSearch.createdTo}
                                            onChange={date => search_data_table("createdTo", date)}
                                            selectsStart
                                            isClearable
                                            dateFormat="dd/MM/yyyy"
                                            minDate={dataSearch.createdFrom || undefined}
                                            maxDate={new Date()}
                                            locale='vi'
                                        />
                                    </div>
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
                                        Người dùng
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
        
        {openDialog && <ModalDialog
            title={dataStatus.title}
            message={dataStatus.message}
            open={openDialog}
            confirm={() => {
                changeStatus(dataStatus.status)
            }}
            cancel={() => setOpenDialog(false)}
        />}
    </div>)
}

export default Home