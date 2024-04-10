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
import ModalAddApartment from './ModalAddApartment';
import ModalDetailApartment from './ModalDetailApartment';
import "./Apartment.scss";
import { useSnackbar } from 'notistack';
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Tab, Grid, Stack } from '@mui/material'
import Select from 'react-select'
import { DataGrid } from '@mui/x-data-grid';
import { FaEdit } from "react-icons/fa";
import { format_full_time } from '@utils/format_time';
import AddIcon from '@mui/icons-material/Add';
import { FaLockOpen } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { ModalDialog } from '@components'

const ListApartment = () => {
	const apartmentCurrent = useSelector((state) => state.apartment?.current) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [listApartment, setListApartment] = useState([])
    const [sort, setSort] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const toggle_sort = () => {
        return setSort(!sort)
    }
    const [dataAdd, setDataAdd] = useState({})
    const [dataStatus, setDataStatus] = useState({})
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
        get_list_apartment(sort)
    }, [apartmentCurrent])

    useEffect(() => {
        get_list_apartment(sort)
    }, [sort])

    const get_list_apartment = async (sortStatus) => {
        let input = {
            sort: sortStatus || 'false'
        }
        const res = await http_request({method: "GET", url:"cms/apartments", params: input})
		const { code, data, message } = res
        if (code == 200) {
            setListApartment(data.items)
            setDataAdd(data)
            return true
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

	const done_action = () => {
		setModalAdd(false)
		setModalDetail(false)
        setOpenDialog(false)
        return get_list_apartment()
	}

	const open_detail = (item) => {
		setOpenDialog(true)
        setDataStatus(item.status ? {
            status: 0,
            title: 'Khóa',
            message: 'Bạn có muốn khóa?'
        } : {
            status: 1,
            title: 'Mở khóa',
            message: 'Bạn có muốn mở khóa?'
        })
        return setDataSelect(item)
	}

	const render_action = (item) => {
        return ( item.status == 0 ? <div>
            <FaLockOpen title='Mở khóa' className='pointer-btn'
                onClick={()=>open_detail(item)}
            />
        </div> : <div>
            <FaLock title='Khóa' className='pointer-btn'
                onClick={()=>open_detail(item)}
            />
        </div>)
	}

	const render_status = (status) => {
		if (status === 1) return <Button className='btn-status' color='success' size='sm'>Hoạt động</Button>
        return <Button className='btn-status' color='error' size='sm'>Khóa</Button>
	}

    const changeStatus = async (status) => {
        let input = {
            status: status
        }
		const res = await http_request({ method: "PUT", url: `cms/apartment/${dataSelect._id}`, data: input })
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

    const columns = [
		{ field: 'stt', headerName: 'STT', width: 20, align: "center",},
		{ field: 'name', headerName: 'Tên khu trọ', width: 100, flex: 1 },
		{ field: 'phone', headerName: 'SĐT', width: 200,},
		{ field: 'address', headerName: 'Địa chỉ', flex: 1 },
		{ field: 'createdAt', headerName: 'Ngày tạo', width: 150, 
            renderCell: (params) => (
                <div>
                    {format_date_time(params.row.createdAt)}
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
                        <span className='header-text'>Quản lý nhà trọ</span>
                    </div>
                    <div className='float-end'>
                        <Button
                            onClick={() => toggle_modal_add()}
                            className=''
                            variant="contained"
                            endIcon={<AddIcon />}
                        >
                            Thêm mới
                        </Button>
                        <Button
                            onClick={() => toggle_sort()}
                        >
                            {!sort ? <FaSortAmountDown/> : <FaSortAmountUp/>}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardBody>
                <div className='group-container'>
                    <div style={{ height: '100%', width: '100%' }}>
                        <DataGrid 
                            getRowId={(row) => row._id}
                            columns={columns}
                            rows={listApartment.map((item, index) => {
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
                <span className='float-end'>Tổng cộng: {dataAdd.total}</span>
            </CardFooter>
        </Card>

        {modalAdd && <ModalAddApartment
            _modal={modalAdd}
            _toggleModal={toggle_modal_add}
            _done_action={done_action}
        />}
        {modalDetail&& <ModalDetailApartment
            _modal={modalDetail}
            _toggleModal={toggle_modal_detail}
            _done_action={done_action}
            _dataSelect={dataSelect}
        />}
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


export default ListApartment