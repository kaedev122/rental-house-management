import React, { Fragment, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
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
import ModalAddGroup from './ModalAddGroup';
import ModalAddRoom from './ModalAddRoom';
import ModalDetailRoom from './ModalDetailRoom';
import ModalAddContract from '../contract/ModalAddContract';
import ModalDetailContract from '../contract/ModalDetailContract';
import ModalAddBill from '../bill/ModalAddBill';
import ModalDetailBill from '../bill/ModalDetailBill';
import ModalPayBill from '../bill/ModalPayBill';
import "./Home.scss";
import { FaEdit } from "react-icons/fa";
import { useSnackbar } from 'notistack';
import { MdReadMore } from "react-icons/md";
import moment from 'moment-timezone';
import 'moment/locale/vi'; 
moment().tz("Asia/Ho_Chi_Minh").format();
moment.locale('vi')
import AddIcon from '@mui/icons-material/Add';
import { MdOutlineBedroomChild } from "react-icons/md";
import ModalAddApartment from '../apartment/ModalAddApartment';

const Home = () => {
	const apartmentCurrent = useSelector((state) => state.apartment?.current) || get_local_storage("apartment", "")

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [listRoomGroup, setListRoomGroup] = useState([])
    const [groupSelected, setGroupSelected] = useState('')
    const [roomSelected, setRoomSelected] = useState('')
    const [contractSelected, setContractSelected] = useState('')
    const [billSelected, setBillSelected] = useState('')
    const [roomData, setRoomData] = useState({})
    const [groupData, setGroupData] = useState({})
    const [sort, setSort] = useState(false)
    const [apartmentData, setDataApartment] = useState({})
    const toggle_sort = () => {
        return setSort(!sort)
    }
    const [dataAdd, setDataAdd] = useState({})

    const [modalAddGroup, setModalAddGroup] = useState(false);
    const toggle_modal_add_group = () => {
        return setModalAddGroup(!modalAddGroup)
    }

    const [modalDetailGroup, setModalDetailGroup] = useState(false);
    const toggle_modal_detail_group = () => {
        return setModalDetailGroup(!modalDetailGroup)
    }

    const [modalAddRoom, setModalAddRoom] = useState(false);
    const toggle_modal_add_room = () => {
        return setModalAddRoom(!modalAddRoom)
    }

    const [modalDetailRoom, setModalDetailRoom] = useState(false);
    const toggle_modal_detail_room = () => {
        return setModalDetailRoom(!modalDetailRoom)
    }

    const [modalAddContract, setModalAddContract] = useState(false);
    const toggle_modal_add_contract = () => {
        return setModalAddContract(!modalAddContract)
    }

    const [modalDetailContract, setModalDetailContract] = useState(false);
    const toggle_modal_detail_contract = () => {
        return setModalDetailContract(!modalDetailContract)
    }

    const [modalAddBill, setModalAddBill] = useState(false);
    const toggle_modal_add_bill = () => {
        return setModalAddBill(!modalAddBill)
    }

    const [modalDetailBill, setModalDetailBill] = useState(false);
    const toggle_modal_detail_bill = () => {
        return setModalDetailBill(!modalDetailBill)
    }

    const [modalAddApartment, setModalAddApartment] = useState(false);
    const toggle_modal_add_apartment = () => {
        return setModalAddApartment(!modalAddApartment)
    }

    const [modalPay, setModalPay] = useState(false);
    const toggle_modal_pay = () => {
        return setModalPay(!modalPay)
    }

    const [customersData, setCustomersData] = useState([])
    const [servicesData, setServicesData] = useState([])
    const [services, setServices] = useState([])
    const [dataSelect, setDataSelect] = useState({})

    useEffect(() => {
        get_list_room_group_data(sort)
    }, [apartmentCurrent, sort])

    useEffect(() => {
        if (apartmentCurrent) get_data_apartment()
        else toggle_modal_add_apartment()
    }, [])

    const get_data_apartment = async () => {
        const res = await http_request({method: "GET", url:`cms/apartment/${apartmentCurrent}`})
		const { code, data, message } = res
        if (code == 200) {
            setDataApartment(data)
            return true
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
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
            setDataSelect({
                ...data,
                customers: data?.customers.map(item => {
                    return item._id
                }
            )})
            setServices(data.other_price.map(item => {return item.service_id}))
            return setCustomersData(data.customers)
        }
    }

    const get_list_room_group_data = async (sortStatus) => {
        let input = {
            status: 1,
            apartment: apartmentCurrent,
            sort: sortStatus || 'false'
        }
        const res = await http_request({method: "GET", url:"cms/room-group-extend", params: input})
		const { code, data, message } = res
        if (code == 200) {
            console.log(data)
            setListRoomGroup(data.items)
            setDataAdd(data)
            return true
        }
    }

    const add_room = (group_id) => {
        setGroupSelected(group_id)
        return toggle_modal_add_room()
    }    
    
    const add_contract = (room_id) => {
        setRoomSelected(room_id)
        return toggle_modal_add_contract()
    }

    const add_bill = (contract_id) => {
        setContractSelected(contract_id)
        return toggle_modal_add_bill()
    }

    const open_pay_bill = (bill_id) => {
        setBillSelected(bill_id)
        return toggle_modal_pay()
    }

	const open_contract_detail = async (item) => {
        await get_contract_data(item)
        return toggle_modal_detail_contract()
	}

	const open_room_detail = async (item) => {
        setRoomData(item)
        return toggle_modal_detail_room()
	}

	const done_action = (isNewApartment=false) => {
        if (isNewApartment) {
            return window.location.reload();
        }
		setModalAddGroup(false)
		setModalAddRoom(false)
		setModalAddBill(false)
		setModalPay(false)
		setModalAddContract(false)
        setModalDetailContract(false)
        setModalDetailRoom(false)
        setModalAddApartment(false)
        return get_list_room_group_data()
	}

    const render_room_group = () => {
        return listRoomGroup.map((item, index) => (
            <Accordion>
                <AccordionSummary
                    className='group-header'
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${index}-header`}
                    id={`panel-${index}-header`}
                    key={`panel-${index}-header`}
                >
                    <div className='d-flex align-items-center'>
                        <span className='d-flex align-items-center group-label'>{item.name}</span>&nbsp;<span>({item.rent}/{item.totalRoom} P.Đã được thuê)</span>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <Row>
                        {render_room(item.rooms)} 
                    </Row>
                    <Row className='mt-2 d-flex justify-content-center'>
                        <Button
                            onClick={() => add_room(item._id)}
                            className='w-25' 
                            variant="contained" 
                            color="primary" 
                        >
                            Thêm phòng
                        </Button>
                    </Row>
                </AccordionDetails>
            </Accordion>
        ))
    }

    const render_bill_status = (item) => {
        if (item.bill_status == 0) {
            return (<div
                className='text-danger'
                onClick={() => add_bill(item._id)}
            >   
                <RiWaterFlashFill/> Chưa ghi điện & nước
            </div>)
        }
        if (item.bill_status == 1) {
            return (<div
                className='text-success'
            >
                <RiWaterFlashFill/> Đã ghi điện & nước (Thg-{moment(item?.last_check_date).format('M') - 1})
            </div>)
        }
        if (item.bill_status == 2) {
            return (<div
                className='text-success'
            >
                <RiWaterFlashFill/> Tháng đầu
            </div>)
        }
    }

    const render_payment_status = (item) => {
        if (item.payment_status === "") {
            return (<div>
                <FaMoneyBillWaveAlt /> ---
            </div>)
        }
        if (item.payment_status == 1) {
            return (<div 
                className='text-warning text-warning-hover'
                onClick={() => {open_pay_bill(item)}}
            >
                <FaMoneyBillWaveAlt /> Thanh toán một phần
            </div>)
        }
        if (item.payment_status == 2) {
            return (
            <div className='text-success'>
                <FaMoneyBillWaveAlt /> Đã thanh toán
            </div>)
        }
        return (
            <div className='text-danger text-danger-hover' onClick={() => {open_pay_bill(item)}}>
                <FaMoneyBillWaveAlt /> Chưa thanh toán
            </div>)
        }

    const render_room = (rooms) => {
        return rooms.map((item, index) => (
            <Col xxl={4} xl={6}>
                <div className={item.contract ? `border room-card-container border-secondary px-3 room-status-rented` : `border room-card-container border-secondary px-3 room-status-open`}>
                    <Row className='room-card-header'>
                        <Col md={6} className=''>
                            <span 
                                className='text-info-hover d-flex label-text align-items-center'
                                onClick={() => open_room_detail(item)}
                            >
                                <FaBed />&nbsp;{item.name}
                            </span>
                        </Col>
                        <Col md={6} className=''>
                            <span className='d-flex float-end label-text align-items-center'>
                                {item?.contract?.customers.length || "---"}&nbsp;<IoPeopleSharp />
                            </span>
                        </Col>
                    </Row>
                    <Row className='border-top'>
                        <Col md={6} className='justify-content-center'>
                            <BsPersonCircle /> {item.customer_represent ? item?.customer_represent?.fullname : "---"}
                        </Col>
                        <Col md={6} className='border-start'>
                            <FaPhoneAlt /> {item.customer_represent ? item?.customer_represent?.phone : "---"}
                        </Col>
                    </Row>
                    <Row className='border-top'>
                        <Col md={6}>
                            <FaDollarSign /> {`${(item?.room_price || 0).toLocaleString()} đ`}
                        </Col>
                        <Col md={6} className='border-start'>
                            <BsLightningChargeFill/> {`${(item?.electric_price || 0).toLocaleString()} đ`} - <IoWaterSharp/> {`${(item?.water_price || 0).toLocaleString()} đ`}
                        </Col>
                    </Row>
                    <Row className='border-top'>
                        <Col md={6}>
                            {item?.contract ? <div 
                                className='text-info text-info-hover'
                                onClick={() => open_contract_detail(item.contract)}>
                                <FaHandshakeSimple /> {format_date_time(item?.contract?.date_start)} <MdReadMore />
                            </div> :
                            <div
                                className='text-danger text-danger-hover'
                                onClick={() => add_contract(item._id)}
                            >
                                <FaHandshakeSimple /> Tạo hợp đồng
                            </div>}
                        </Col>
                        <Col md={6} className='border-start'>
                            <FaHandshakeSimpleSlash /> {format_date_time(item?.contract?.date_end)}
                        </Col>
                    </Row>
                    <Row className='border-top'>
                        <Col md={6} className={(item?.contract?.bill_status === 0) ? 'text-hover' : ''}>
                            {item?.contract ? render_bill_status(item?.contract) : <div><RiWaterFlashFill/> ---</div>}
                        </Col>
                        <Col md={6} className={(item?.bill?.payment_status === 1 || item?.bill?.payment_status === 0) ? 'border-start text-hover' : 'border-start'}>
                            {render_payment_status(item?.bill)}
                        </Col>
                    </Row>
                </div>
            </Col>
        ))
    }

    return (<div id="main-content">
        <Card>
            <CardHeader>
                <div className='d-flex justify-content-between align-items-center'>
                    <div>
                        <span className='header-text'>Quản trị chung</span>
                    </div>
                    <div className='d-flex legend-container'>
                        <div className='legend-open-room legend-item legend-item-1'>
                            P.Trống ({dataAdd?.totalOpen || "---"})
                        </div>
                        <div className='legend-rented-room legend-item legend-item-2'>
                            P.Đã được thuê ({dataAdd?.totalRent || "---"})
                        </div>
                    </div>
                    <div className='float-end'>
                        {apartmentCurrent && (<Button
                            onClick={() => toggle_modal_add_group()}
                            variant="contained"
                            endIcon={<AddIcon />}
                        >
                            Thêm mới
                        </Button>)}
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
                    {render_room_group()}
                </div>
            </CardBody>
            <CardFooter>
                <span className='float-end'>Tổng: {dataAdd.total || "---"}</span>
            </CardFooter>
        </Card>

        {modalAddGroup && <ModalAddGroup
            _modal={modalAddGroup}
            _toggleModal={toggle_modal_add_group}
            _done_action={done_action}
        />}
        
        {/* {modalDetailGroup && <ModalDetailGroup
            _modal={modalDetailGroup}
            _dataSelect={groupData}
            _toggleModal={toggle_modal_detail_group}
            _done_action={done_action}
        />} */}

        {modalAddRoom && <ModalAddRoom
            _modal={modalAddRoom}
            _toggleModal={toggle_modal_add_room}
            _group_selected={groupSelected} 
            _done_action={done_action}
            _apartmentData={apartmentData}
        />}

        {modalAddContract && <ModalAddContract
            _modal={modalAddContract}
            _toggleModal={toggle_modal_add_contract}
            _room_selected={roomSelected} 
            _done_action={done_action}
        />}

        {modalDetailContract && <ModalDetailContract
            _modal={modalDetailContract}
            _toggleModal={toggle_modal_detail_contract}
            _dataSelect={dataSelect}
            _customersData={customersData}
            _servicesData={servicesData}
            _services={services}
            _done_action={done_action}
        />}

        {modalDetailRoom && <ModalDetailRoom
            _modal={modalDetailRoom}
            _toggleModal={toggle_modal_detail_room}
            _dataSelect={roomData}
            _apartmentData={apartmentData}
            _done_action={done_action}
        />}

        {modalAddBill && <ModalAddBill
            _modal={modalAddBill}
            _toggleModal={toggle_modal_add_bill}
            _contract_id={contractSelected}
            _done_action={done_action}
        />}

        {modalPay && <ModalPayBill
            _modal={modalPay}
            _toggleModal={toggle_modal_pay}
            _done_action={done_action}
            _dataSelect={billSelected}
        />}

        {modalAddApartment && <ModalAddApartment
            _modal={modalAddApartment}
            _toggleModal={toggle_modal_add_apartment}
            _done_action={done_action}
        />}
    </div>)
}



export default Home