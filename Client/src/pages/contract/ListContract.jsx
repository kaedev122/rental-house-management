import React, { Fragment, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Col, Row, Modal, ModalHeader, UncontrolledDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap'
import { http_request, get_local_storage, is_empty, } from '@utils'
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
import ModalAddContract from './ModalAddContract';
import ModalDetailContract from './ModalDetailContract';
import "./contract.scss";
import { useSnackbar } from 'notistack';
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Tab, Grid, Stack } from '@mui/material'
import Select from 'react-select'
import { DataGrid } from '@mui/x-data-grid';
import { FaEdit } from "react-icons/fa";
import { format_full_time } from '@utils/format_time';
import { Paginations, SearchBar } from "@components"

const ListContract = () => {
	const apartmentCurrent = useSelector((state) => state.apartment?.curent) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [listApartment, setListApartment] = useState([])
    const [sort, setSort] = useState(false)
    const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
    const [dataTable, setDataTable] = useState([]);
	const [totalRecord, setTotalRecord] = useState(0);
	const [totalPages, setTotalPage] = useState(0);
    const toggle_sort = () => {
        return setSort(!sort)
    }
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

    const [customersData, setCustomersData] = useState([])
    const [servicesData, setServicesData] = useState([])
    const [services, setServices] = useState([])

	const list_status = [
        {
			'text': 'Hoạt động',
			'value': 1,
		},{
			'text': 'Kết thúc',
			'value': 0,
		},{
			'text': 'Tất cả',
			'value': ""
		},
	]

    useEffect(() => {
        if (apartmentCurrent) {
            get_list_contract({
			...dataSearch,
			"apartment": apartmentCurrent,
			"page": page,
            "limit": size,
            "sort": sort || 'false'
		})}
    }, [apartmentCurrent, sort])

    const search_table = (data_search) => {
		setSize(data_search.limit || size)
		setPage(data_search.page)
		return search_data_input(data_search)
	}

    const get_contract_data = async (contract) => {
        const res = await http_request({method: "GET", url:`cms/contract/${contract._id}`})
		const { code, data, message } = res
        if (code == 200) {
            setServicesData(data.other_price.map(item => {
                return {
                    ...item,
                    _id: item.service_id
                }
            }))
            setServices(data.other_price.map(item => {return item.service_id}))
            return setCustomersData(data.customers)
        }
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

	const render_selected = (list_select, selected) => {
		const new_list = list_select.filter(item => item.value == selected)
		if (is_empty(new_list)) {
			return list_select[0]?.text
		}
		return new_list[0]?.text
	}
    const get_list_contract = async (dataInput) => {
        let input = {
            ...dataInput,
            "limit": size
        }
        const res = await http_request({method: "GET", url:"cms/contracts", params: input})
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
        await get_contract_data(item)
        return toggle_modal_detail()
	}

	const done_action = () => {
		setModalAdd(false)
		setModalDetail(false)
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
		if (status === 1) return <Button className='btn-status' color='success' size='sm'>Hoạt động</Button>
		return <Button className='btn-status' color='error' size='sm'>Kết thúc</Button>
	}

    const render_customers = (customers) => {
		return <Button className='btn-status' color='primary' size='sm'>{customers.length}</Button>
	}

    const columns = [
		{ field: 'stt', headerName: 'STT', width: 20, align: "center",},
		{ field: 'code', headerName: 'Mã hợp đồng', width: 100, flex: 1 },
		{ field: 'name', headerName: 'Phòng', flex: 1,
            valueGetter: (params) => `${params.row.room.name}`
        },
		{ field: 'fullname', headerName: 'Người đại diện', flex: 1,            
            valueGetter: (params) => `${params.row.customer_represent.fullname}`
        },		
        { field: 'phone', headerName: 'SĐT liên lạc', flex: 1,            
            valueGetter: (params) => `${params.row.customer_represent.phone}`
        },
		{ field: 'customers', headerName: 'Số người', width: 150, 
            renderCell: (params) => (
                <div>
                    {render_customers(params.row.customers)}
                </div>
            ),	 
        },
		{ field: 'date_start', headerName: 'Ngày bắt đầu', width: 150, 
            renderCell: (params) => (
                <div>
                    {format_date_time(params.row.date_start)}
                </div>
            ),	 
        },
        { field: 'date_end', headerName: 'Ngày kết thúc', width: 150, 
            renderCell: (params) => (
                <div>
                    {format_date_time(params.row.date_end)}
                </div>
            ),	 
        },
		{ field: 'status', headerName: 'Trạng thái', width: 150, align: "center",
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
    return (<div id="main-content">
        <Card>
            <CardHeader>
                <div className='d-flex justify-content-between align-items-center'>
                    <div>
                        <span className='header-text'>Quản lý hợp đồng</span>
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

        {modalAdd && <ModalAddContract
            _modal={modalAdd}
            _toggleModal={toggle_modal_add}
            _done_action={done_action}
        />}

        {modalDetail && <ModalDetailContract
            _modal={modalDetail}
            _toggleModal={toggle_modal_detail}
            _done_action={done_action}
            _dataSelect={dataSelect}
            _customersData={customersData}
            _servicesData={servicesData}
            _services={services}
        />}
    </div>)
}


export default ListContract