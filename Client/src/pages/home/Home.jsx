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
import ModalAddGroup from './ModalAddGroup';
import ModalAddRoom from './ModalAddRoom';
import ModalAddContract from './ModalAddContract';
import "./Home.scss";

const Home = () => {
	const apartmentCurent = useSelector((state) => state.apartment?.curent) || get_local_storage("apartment", "")
    const [listRoomGroup, setListRoomGroup] = useState([])
    const [groupSelected, setGroupSelected] = useState('')
    const [roomSelected, setRoomSelected] = useState('')
    const [sort, setSort] = useState(false)
    const toggle_sort = () => {
        return setSort(!sort)
    }
    const [dataAdd, setDataAdd] = useState({})

    const [modalAddGroup, setModalAddGroup] = useState(false);
    const toggle_modal_add_group = () => {
        return setModalAddGroup(!modalAddGroup)
    }

    const [modalAddRoom, setModalAddRoom] = useState(false);
    const toggle_modal_add_room = () => {
        return setModalAddRoom(!modalAddRoom)
    }

    const [modalAddContract, setModalAddContract] = useState(false);
    const toggle_modal_add_contract = () => {
        return setModalAddContract(!modalAddContract)
    }

    useEffect(() => {
        get_list_room_group_data(sort)
    }, [apartmentCurent])

    useEffect(() => {
        get_list_room_group_data(sort)
    }, [sort])

    const get_list_room_group_data = async (sortStatus) => {
        let input = {
            status: 1,
            apartment: apartmentCurent,
            sort: sortStatus || 'false'
        }
        const res = await http_request({method: "GET", url:"cms/room-group-extend", params: input})
		const { code, data, message } = res
        if (code == 200) {
            setListRoomGroup(data.items)
            setDataAdd(data)
            return true
        }
        return res
    }

    const add_room = (group_id) => {
        setGroupSelected(group_id)
        return toggle_modal_add_room()
    }    
    
    const add_contract = (room_id) => {
        setRoomSelected(room_id)
        return toggle_modal_add_contract()
    }

	const done_action = () => {
		setModalAddGroup(false)
		setModalAddRoom(false)
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
                    <span className='d-flex align-items-center'>{item.name} - <MdOutlineSensorDoor />{item.totalRoom} phòng</span>
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

    const render_room = (rooms) => {
        return rooms.map((item, index) => (
            <Col md={4}>
                <div className='border room-card-container border-secondary px-3'>
                    <Row className='room-card-header'>
                        <Col md={6} className=''>
                            <span className='d-flex  label-text align-items-center'>
                                <FaBed />&nbsp;{item.name}
                            </span>
                        </Col>
                        <Col md={6} className=''>
                            <span className='d-flex float-end label-text align-items-center'>
                                {item?.contract?.customers.length || 0}&nbsp;<IoPeopleSharp />
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
                            <FaHandshakeSimple /> {item?.contract ? format_date_time(item?.contract?.date_start) : 
                            <span
                                onClick={() => add_contract(item._id)}
                            >Tạo hợp đồng</span>}
                        </Col>
                        <Col md={6} className='border-start'>
                            <FaHandshakeSimpleSlash /> {format_date_time(item?.contract?.date_end)}
                        </Col>
                    </Row>
                    <Row className='border-top'>
                        <Col md={6}>
                            <RiWaterFlashFill /> {item?.contract ? "Đã ghi số điện & nước" : '---'}
                        </Col>
                        <Col md={6} className='border-start'>
                            <FaMoneyBillWaveAlt /> {item?.contract ? "Đã thanh toán" : '---'}
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
                        <span>Quản trị chung</span>
                        {apartmentCurent && (<Button
                            onClick={() => toggle_modal_add_group()}
                            className=''
                        >
                            Thêm mới +
                        </Button>)}
                    </div>
                    <div className='float-end'>
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
                <span className='float-end'>Tổng cộng: {dataAdd.total}</span>
            </CardFooter>
        </Card>

        {modalAddGroup && <ModalAddGroup
            _modal={modalAddGroup}
            _toggleModal={toggle_modal_add_group}
            _done_action={done_action}
        />}

        {modalAddRoom && <ModalAddRoom
            _modal={modalAddRoom}
            _toggleModal={toggle_modal_add_room}
            _group_selected={groupSelected} 
            _done_action={done_action}
        />}

        {modalAddContract && <ModalAddContract
            _modal={modalAddContract}
            _toggleModal={toggle_modal_add_contract}
            _room_selected={roomSelected} 
            _done_action={done_action}
        />}
    </div>)
}



export default Home