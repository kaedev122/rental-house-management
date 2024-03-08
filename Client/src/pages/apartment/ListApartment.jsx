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
import "./Apartment.scss";

const ListApartment = () => {
	const apartmentCurent = useSelector((state) => state.apartment?.curent) || get_local_storage("apartment", "")
    const [listApartment, setListApartment] = useState([])
    const [sort, setSort] = useState(false)
    const toggle_sort = () => {
        return setSort(!sort)
    }
    const [dataAdd, setDataAdd] = useState({})

    const [modalAdd, setModalAdd] = useState(false);
    const toggle_modal_add = () => {
        return setModalAdd(!modalAdd)
    }

    useEffect(() => {
        get_list_apartment(sort)
    }, [apartmentCurent])

    useEffect(() => {
        get_list_apartment(sort)
    }, [sort])

    const get_list_apartment = async (sortStatus) => {
        let input = {
            status: 1,
            sort: sortStatus || 'false'
        }
        const res = await http_request({method: "GET", url:"cms/apartments", params: input})
		const { code, data, message } = res
        if (code == 200) {
            setListApartment(data.items)
            setDataAdd(data)
            return true
        }
        return res
    }

	const done_action = () => {
		setModalAdd(false)
        return get_list_apartment()
	}

    const render_apartment = () => {
        return listApartment.map((item, index) => (
            <Accordion>
                <AccordionSummary
                    className='apartment-header'
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${index}-header`}
                    id={`panel-${index}-header`}
                    key={`panel-${index}-header`}
                >
                    <span>{index + 1}.<span className='d-flex align-items-center'>{item.name}</span></span>
                </AccordionSummary>
                <AccordionDetails>
                    <Row>

                    </Row>
                    <Row className='mt-2 d-flex justify-content-center'>

                    </Row>
                </AccordionDetails>
            </Accordion>
        ))
    }

    return (<div id="main-content">
        <Card>
            <CardHeader>
                <div className='d-flex justify-content-between align-items-center'>
                    <div>
                        <span>Quản lý nhà trọ</span>
                        <Button
                            onClick={() => toggle_modal_add()}
                            className=''
                        >
                            Thêm mới +
                        </Button>
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
                    {render_apartment()}
                </div>
            </CardBody>
            <CardFooter>
                <span className='float-end'>Tổng cộng: {dataAdd.total}</span>
            </CardFooter>
        </Card>

        {ModalAddApartment && <ModalAddApartment
            _modal={modalAdd}
            _toggleModal={toggle_modal_add}
            _done_action={done_action}
        />}
    </div>)
}


export default ListApartment