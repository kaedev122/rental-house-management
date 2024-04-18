import React, { Fragment, useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Card, Label, CardHeader, Input, CardBody, CardFooter, Col, Row, Modal, ModalHeader, UncontrolledDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap'
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
import DatePicker, { registerLocale } from "react-datepicker"
import viLocale from 'date-fns/locale/vi'
registerLocale('vi', viLocale)
import 'react-datepicker/dist/react-datepicker.css'
import { MdOutlineSensorDoor } from "react-icons/md";
import "./report.scss";
import { useSnackbar } from 'notistack';
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Tab, Grid, Stack } from '@mui/material'
import Select from 'react-select'
import { DataGrid } from '@mui/x-data-grid';
import { FaEdit } from "react-icons/fa";
import { format_full_time } from '@utils/format_time';
import { Paginations, SearchBar } from "@components"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import moment from "moment"

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,  
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

export const barOptions = {
    plugins: {
        title: {
            display: false,
        },
    },
    responsive: true,
    scales: {
        x: {
            stacked: true,
        },
        y: {
            stacked: true,
        },
    },
};

export const lineOptions = {
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: false,
        },
    },
    scales: {
        x: {
            stacked: true,
        },
        y: {
            stacked: true,
        },
    },
};

const ListRevenue = () => {
	const apartmentCurrent = useSelector((state) => state.apartment?.current) || get_local_storage("apartment", "")
    const [dataSearch, setDataSearch] = useState({})
    const [listRoomGroup, setListRoomGroup] = useState([])
    const [listYear, setListYear] = useState(() => {
        let listYear = []
        let curYear = moment().format("YYYY")
        for (let i = 2023; i <= curYear; i++) {
            listYear.push(i)
        }
        return listYear
    })
    const [group, setGroup] = useState('')
    const [year, setYear] = useState(moment().format("YYYY"))
    const [chartBarData, setChartBarData] = useState({
        labels: [],
        datasets: []
    })
    const [chartLineData, setChartLineData] = useState({
        labels: [],
        datasets: []
    })

    useEffect(() => {
        if (apartmentCurrent) {
            get_debt_report({
                ...dataSearch,
                "apartment": apartmentCurrent,
            })
            get_list_room_group_data()
            get_income_report({
                "apartment": apartmentCurrent,
                "year": year
            })
        }
    }, [apartmentCurrent])

    useEffect(() => {
        if (apartmentCurrent) {
            get_debt_report({
                ...dataSearch,
                "apartment": apartmentCurrent,
                "group": group
            })
        }
        setDataSearch({
            ...dataSearch,
            group: group
        })
    }, [group])

    useEffect(() => {
        if (apartmentCurrent) {
            get_income_report({
                "apartment": apartmentCurrent,
                "year": year
            })
        }
    }, [year])

	const search_data_table = async (type, value) => {
		setDataSearch({
			...dataSearch,
			[type]: value,
		})
		return await get_debt_report({
			...dataSearch,
			[type]: value,
		})
	}

    const get_list_room_group_data = async () => {
        let input = {
            status: 1,
            apartment: apartmentCurrent,
        }
        const res = await http_request({method: "GET", url:"cms/list-room-group", params: input})
		const { code, data, message } = res
        if (code == 200) {
            setListRoomGroup(data.items)
            return true
        }
    }

    const get_debt_report = async (dataInput) => {
        let input = {
            apartment: apartmentCurrent,
            ...dataInput,
        }
        const res = await http_request({method: "GET", url:"cms/report-debt", params: input})
		const { code, data, message } = res
        if (code == 200) {
            let result = {
                labels: data.map(item => {
                    return item.name
                }),
                datasets: [
                    {
                        label: 'Còn nợ',
                        data: data.map(item => {
                            return item.total_debt
                        }),
                        backgroundColor: 'rgb(255, 99, 132)',
                    },{
                        label: 'Đã thu',
                        data: data.map(item => {
                            return item.total_paid
                        }),
                        backgroundColor: 'rgb(75, 192, 192)',
                    }
                ]
            }
            return setChartBarData(result)
        }
    }

    const get_income_report = async (dataInput) => {
        let input = {
            ...dataInput,
            apartment: apartmentCurrent,
        }
        const res = await http_request({method: "GET", url:"cms/report-income", params: input})
		const { code, data, message } = res
        if (code == 200) {
            let result = {
                labels: data.map(item => {
                    return item.month
                }),
                datasets: [
                    {
                        label: 'Tổng tiền',
                        data: data.map(item => {
                            return item.totalMoney
                        }),
                        borderColor: 'rgb(53, 162, 235)',
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        cubicInterpolationMode: 'monotone',
                        tension: 0.4,
                        fill: false,
                    }
                ]
            }
            return setChartLineData(result)
        }
    }

    const change_group = (value) => {
        console.log(value)
        return setGroup(value)
    }

    const render_time_select = () => {
		return <div className='d-flex ms-2'>
			{format_date_time(dataSearch.dateFrom)} - {format_date_time(dataSearch.dateTo)}
		</div>
	}

    return (
        <div id="main-content">
            <Card>
                <CardHeader>
                    <div className='d-flex justify-content-between align-items-center'>
                        <div>
                            <span className='header-text'>Báo cáo</span>
                        </div>
                        <div className='float-end'>

                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <div className='group-container'>
                        <Row>
                            <Col md={8}>
                                <Row>
                                    <Col md={3}>
                                        <Label>
                                            Chọn nhóm phòng hiển thị
                                        </Label>
                                    </Col>
                                    <Col md={4}>
                                        <Input
                                            id="exampleSelect"
                                            name="select"
                                            type="select"
                                            className='btn-select pointer-btn'
                                            value={group}
                                            onChange={(e) => {
                                                change_group(e.target.value)
                                            }}
                                        >
                                            <option value="" selected>TẤT CẢ</option>
                                            {listRoomGroup && listRoomGroup.map((item) =>{
                                                return (<option key={item._id} value={item._id} >{item.name}</option>)
                                            })}
                                        </Input>
                                    </Col>
                                    <Col className='div-filter d-flex' md={5}>
                                        <UncontrolledDropdown
                                            direction="down"
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
                                                        selected={dataSearch.dateFrom}
                                                        onChange={date => search_data_table("dateFrom", date)}
                                                        isClearable
                                                        dateFormat="dd/MM/yyyy"
                                                        maxDate={dataSearch.dateTo || new Date()}
                                                        locale='vi'
                                                    />
                                                    <DatePicker
                                                        placeholderText="Đến ngày"
                                                        selected={dataSearch.dateTo}
                                                        onChange={date => search_data_table("dateTo", date)}
                                                        selectsStart
                                                        isClearable
                                                        dateFormat="dd/MM/yyyy"
                                                        minDate={dataSearch.dateFrom || undefined}
                                                        maxDate={new Date()}
                                                        locale='vi'
                                                    />
                                                </div>
                                            </DropdownMenu>
                                        </UncontrolledDropdown>
                                    </Col>
                                </Row>
                                <Row style={{height: "70vh"}} className='d-flex justify-content-center align-items-center'>
                                    <Bar 
                                        options={barOptions} 
                                        data={chartBarData} 
                                    />
                                </Row>
                            </Col>
                            <Col md={4}>
                                <Row>
                                    <Col md={3}>
                                        <Label>
                                            Chọn năm
                                        </Label>
                                    </Col>
                                    <Col md={4}>
                                        <Input
                                            id="exampleSelect"
                                            name="select"
                                            type="select"
                                            className='btn-select pointer-btn'
                                            value={year}
                                            onChange={(e) => {
                                                setYear(e.target.value)
                                            }}
                                        >
                                            {listYear && listYear.map((item) =>{
                                                return (<option key={item} value={item} >{item}</option>)
                                            })}
                                        </Input>
                                    </Col>
                                </Row>
                                <Row style={{height: "70vh"}} className='d-flex justify-content-center align-items-center'>
                                    <Line
                                        options={lineOptions} 
                                        data={chartLineData} 
                                    />
                                </Row>
                            </Col>
                        </Row>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}

export default ListRevenue