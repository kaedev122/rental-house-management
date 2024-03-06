import React, { Fragment, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Col, Row } from 'reactstrap'
import { http_request, get_local_storage, is_empty } from '@utils'
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button } from "reactstrap";
import "./Home.scss";

const Home = () => {
	const apartmentCurent = useSelector((state) => state.apartment?.curent) || get_local_storage("apartment", "")
    const [listRoomGroup, setListRoomGroup] = useState([])

    useEffect(() => {
        get_list_room_group_data()
    }, [apartmentCurent])

    const get_list_room_group_data = async () => {
        let input = {
            status: 1,
            apartment: apartmentCurent
        }
        const res = await http_request({method: "GET", url:"cms/room-group-extend", params: input})
		const { code, data, message } = res
        if (code == 200) {
            setListRoomGroup(data.items)
            return true
        }
        return res
    }

    const render_room_group = () => {
        return listRoomGroup.map((item, index) => (
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${index}-header`}
                    id={`panel-${index}-header`}
                    key={`panel-${index}-header`}
                >
                    {item.name} - ({item.totalRoom} phòng)
                </AccordionSummary>
                <AccordionDetails>
                    <Row>
                        {render_room(item.rooms)}
                    </Row>
                </AccordionDetails>
            </Accordion>
        ))
    }

    const render_room = (rooms) => {
        return rooms.map((item, index) => (
            <Col md={4}>
                <Card className='room-card'>
                    <CardHeader className='room-card-header'>{item.name}</CardHeader>
                    <CardBody className='room-card-body'>
                        
                    </CardBody>
                </Card>
            </Col>
        ))
    }

    return (<div id="main-content">
        <Card>
            <CardHeader>
                <h1>Quản trị chung</h1>
            </CardHeader>
            <CardBody>
                {render_room_group()}
            </CardBody>
        </Card>
      </div>)
}

export default Home