import React, { Fragment, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Col, Row, Modal, ModalHeader } from 'reactstrap'
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
import ModalAddCustomer from './ModalAddCustomer';
import ModalDetailCustomer from './ModalDetailCustomer';
import "./Customer.scss";
import { Paginations } from "@components"
import { useSnackbar } from 'notistack';
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Tab, Grid, Stack } from '@mui/material'
import Select from 'react-select'
import { DataGrid } from '@mui/x-data-grid';
import { FaEdit } from "react-icons/fa";

const ListCustomer = () => {
	const apartmentCurrent = useSelector((state) => state.apartment?.curent) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [sort, setSort] = useState(false)
    const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
    const [dataTable, setDataTable] = useState([]);
	const [totalRecord, setTotalRecord] = useState(0);
	const [totalPages, setTotalPage] = useState(0);
    const [dataSearch, setDataSearch] = useState({
        apartment: apartmentCurrent,
	});
    const toggle_sort = () => {
        return setSort(!sort)
    }
    const [dataAdd, setDataAdd] = useState({})
    const [dataSelect, setDataSelect] = useState({})

    const [modalAdd, setModalAdd] = useState(false);
    const toggle_modal_add = () => {
        return setModalAdd(!modalAdd)
    }
    const [modalDetail, setModalDetail] = useState(false);
    const toggle_modal_detail = () => {
        return setModalDetail(!modalDetail)
    }

    useEffect(() => {
        get_list_customer({
			...dataSearch,
			"apartment": apartmentCurrent,
			"page": page,
            "limit": size,
            "sort": sort || 'false'
		})
    }, [apartmentCurrent, sort])

    const search_table = (data_search) => {
		setSize(data_search.limit || size)
		setPage(data_search.page)
		return search_data_input(data_search)
	}

	const search_data_input = async (data_input) => {
		setDataSearch(data_input)
		return await get_list_customer(data_input)
	}

    const get_list_customer = async (dataInput) => {
        let input = {
            ...dataInput,
            "limit": size
        }
        const res = await http_request({method: "GET", url:"cms/customers", params: input})
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

	const open_detail = (item) => {
		toggle_modal_detail()
        return setDataSelect(item)
	}

	const done_action = () => {
		setModalAdd(false)
		setModalDetail(false)
        return get_list_customer({
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
		if (status === 1) return <Button className='btn-status' color='success' size='sm'>Sẵn sàng</Button>
		if (status === 0) return <Button className='btn-status' color='error' size='sm'>Khóa</Button>
		return <Button className='btn-status' color='primary' size='sm'>Đang thuê</Button>
	}

    const columns = [
		{ field: 'stt', headerName: 'STT', width: 20, align: "center",},
		{ field: 'fullname', headerName: 'Tên khách thuê', flex: 1 },
		{ field: 'phone', headerName: 'SĐT', flex: 1 },
		{ field: 'status', headerName: 'Trạng thái', flex: 1,
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
                        <span className='header-text'>Quản lý khách thuê</span>
                        <Button
                            onClick={() => toggle_modal_add()}
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
                    <div style={{ height: '100%', width: '100%' }}>
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

        {modalAdd && <ModalAddCustomer
            _modal={modalAdd}
            _toggleModal={toggle_modal_add}
            _done_action={done_action}
        />}

        {modalDetail && <ModalDetailCustomer
            _modal={modalDetail}
            _toggleModal={toggle_modal_detail}
            _done_action={done_action}
            _dataSelect={dataSelect}
        />}
    </div>)
}


export default ListCustomer