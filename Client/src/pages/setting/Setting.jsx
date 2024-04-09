import React, { Fragment, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Col, Row, Modal, ModalHeader, Label, FormGroup, Input, } from 'reactstrap'
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
import "./setting.scss";
import { Paginations, MapBox } from "@components"
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Tab, Grid, Stack } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid';
import { FaEdit } from "react-icons/fa";
import axios, {isCancel, AxiosError} from 'axios';
import { useSnackbar } from 'notistack';
import ModalAddService from './ModalAddService'
import ModalDetailService from './ModalDetailService'
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import { vi } from 'date-fns/locale/vi';
registerLocale('vi', vi)
import "react-datepicker/dist/react-datepicker.css";
import ImageUploading from 'react-images-uploading';
import { MdFileUpload } from "react-icons/md";

const Setting = () => {
	const apartmentCurrent = useSelector((state) => state.apartment?.current) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [listService, setListService] = useState([])
    const [tabSelected, setTabSelected] = useState("1")
	const [errorForm, setErrorForm] = useState({})
    const selectTab = (e) => {
        setTabSelected(e)
    }
    const [serviceRow, setServiceRow] = useState({});

    const [modalDetailService, setModalDetailService] = useState(false);
    const toggle_modal_detail_service = () => {
        return setModalDetailService(!modalDetailService)
    }

    const [location, setLocation] = useState()

    const [dataAdd, setDataAdd] = useState({})
    const [userData, setUserData] = useState({})
    const [dataApartment, setDataApartment] = useState({})

    const [modalAdd, setModalAdd] = useState(false);
    const toggle_modal_add = () => {
        return setModalAdd(!modalAdd)
    }

    const [imagesPreview, setImagesPreview] = useState("https://res.cloudinary.com/dn3syjps8/image/upload/v1712696651/placeholder/user.png");
    const [images, setImages] = useState([]);
    const [changed, setChanged] = useState(false);

    const onUploadImage = (imageList, addUpdateIndex) => {
        // data for submit
        setImages(imageList);
        setChanged(true)
    };

    useEffect(() => {
        if (apartmentCurrent) {
            get_data_apartment()
            get_list_service()
            get_user_data()
        }
    }, [apartmentCurrent])

    useEffect(() => {
        console.log(imagesPreview)
    }, [imagesPreview])

    const updateLocation = async () => {
        let input = {
            location: JSON.stringify(location),
            address: dataAdd.address
        }
        const res = await http_request({method: "PUT", url:`cms/apartment/${apartmentCurrent}`, data: input})
		const { code, data, message } = res
        if (code == 200) {
            return enqueueSnackbar("Cập nhật thành công", {
                variant: "success",
                autoHideDuration: 5000,
            })
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

    const updateApartment = async () => {
        let input = {
            name: dataAdd.name,
            phone: dataAdd.phone,
            water_price: dataAdd.water_price,
            electric_price: dataAdd.electric_price,
        }
        const res = await http_request({method: "PUT", url:`cms/apartment/${apartmentCurrent}`, data: input})
		const { code, data, message } = res
        if (code == 200) {
            return enqueueSnackbar("Cập nhật thành công", {
                variant: "success",
                autoHideDuration: 5000,
            })
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

    const updateUserData = async () => {
		const formData = new FormData()
        if (userData.fullname) formData.append("fullname", userData.fullname)
        if (userData.phone) formData.append("phone", userData.phone)
        if (userData.email) formData.append("email", userData.email)
        if (userData.address) formData.append("address", userData.address)
        if (userData.birthday) formData.append("birthday", userData.birthday)
        if (changed) formData.append("avatar", images[0]?.file)
        const res = await http_request({method: "POST", url:`auth/change-user-data`, data: formData, up_file: true })
		const { code, data, message } = res
        if (code == 200) {
            return enqueueSnackbar("Cập nhật thành công", {
                variant: "success",
                autoHideDuration: 5000,
            })
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

    const get_location = async (dataInput) => {
        if (!dataInput) {
            if (is_empty(dataAdd.address)) {
                return setErrorForm({
                    "address": {
                        "error": true,
                        "message": "Không được để trống!"
                    }
                })
            }
        }
        await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${dataInput}.json?access_token=${process.env.MAP_TOKEN}`)
            .then((res) => {
                setLocation({
                    longitude: res.data.features[0].center[0],
                    latitude: res.data.features[0].center[1],
                })
            })
    }

    const get_data_apartment = async () => {
        const res = await http_request({method: "GET", url:`cms/apartment/${apartmentCurrent}`})
		const { code, data, message } = res
        if (code == 200) {
            setDataAdd(data)
            setLocation(data?.location || '')
            return true
        }
    }

    const get_user_data = async () => {
        const res = await http_request({method: "GET", url:`auth/user`})
		const { code, data, message } = res
        if (code == 200) {
            setUserData(data)
            if (data.avatar) setImages([{"data_url": data.avatar}])
            return true
        }
    }

	const onChangeData = (type, value, number) => {
        console.log(value)
        setErrorForm({})
        if (number) {
			const result = value.replace(/\D/g, "");
			return setDataAdd({
				...dataAdd,
				[type]: parseInt(result) || '',
			});
		}
		return setDataAdd({
			...dataAdd,
			[type]: value
		})
	}

	const onChangeUserData = (type, value, number) => {
        console.log(value)
        setErrorForm({})
        if (number) {
			const result = value.replace(/\D/g, "");
			return setUserData({
				...userData,
				[type]: parseInt(result) || '',
			});
		}
		return setUserData({
			...userData,
			[type]: value
		})
	}

    const get_list_service = async () => {
        let input = {
            status: 1,
            apartment: apartmentCurrent
        }
        const res = await http_request({method: "GET", url:"cms/setting/services", params: input})
		const { code, data, message } = res
        if (code == 200) {
            setListService(data.items)
            return true
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

    const columns = [
		{ field: 'stt', headerName: 'STT', width: 20, align: "center",},
		{ field: 'name', headerName: 'Tên dịch vụ', flex: 1 },
		{ field: 'price', headerName: 'Giá', flex: 1, 
            valueGetter: (params) => `${params.row.price.toLocaleString()} đ`
        },
        { field: 'action', headerName: 'Hành động', width: 100, align: "center",
            renderCell: (params) => (
                <div>
                    {render_action(params.row)}
                </div>
            ),	
        },
	]

    const open_service_detail = (item) => {
		toggle_modal_detail_service()
        return setServiceRow(item)
	}

	const render_action = (item) => {
        return (<div>
            <FaEdit title='Sửa' className='pointer-btn'
                onClick={()=>open_service_detail(item)}
            />
        </div>)
	}

	const done_action = () => {
		setModalAdd(false)
		setModalDetailService(false)
        get_data_apartment()
        return get_list_service()
	}

    return (<div id="main-content">
        <Card>
            <CardHeader>
                <div className='d-flex justify-content-between align-items-center'>
                    <div>
                        <span className='header-text'>Cài đặt nhà trọ</span>
                        {/* <Button
                            onClick={() => toggle_modal_add()}
                            className=''
                        >
                            Thêm mới +
                        </Button> */}
                    </div>
                    {/* <div className='float-end'>
                        <Button
                            onClick={() => toggle_sort()}
                        >
                            {!sort ? <FaSortAmountDown/> : <FaSortAmountUp/>}
                        </Button>
                    </div> */}
                </div>
            </CardHeader>
            <CardBody>
                <div className='group-container'>
                    <TabContext value={tabSelected}>
                        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                            <TabList
                                aria-label="lab API tabs example"
                            >
                                <Tab label="1. Thông tin tài khoản" value="1" index={1} onClick={() => selectTab("1")} />
                                <Tab label="2. Thông tin nhà trọ" value="2" index={2} onClick={() => selectTab("2")} />
                                <Tab label="3. Địa chỉ và vị trí" value="3" index={3} onClick={() => selectTab("3")} />
                            </TabList>
                        </Box>
                        <TabPanel index={1} key={"1"} value={"1"}>
                            <Row>
                                <Col md={8}>
                                    <Row>
                                        <Label>
                                            Họ và tên
                                        </Label>
                                        <FormGroup>
                                            <Input
                                                id="fullname"
                                                name="fullname"
                                                error={errorForm.fullname?.error}
                                                placeholder="Họ và tên"
                                                disabled={!apartmentCurrent}
                                                type="text"
                                                value={userData.fullname}
                                                onChange={(e) =>
                                                    onChangeUserData("fullname", e.target.value)
                                                }
                                            />
                                            {errorForm.fullname?.error && <div className='text-error'>{errorForm.fullname?.message}</div>}
                                        </FormGroup>
                                    </Row>
                                    <Row>
                                        <Label>
                                            Số điện thoại
                                        </Label>
                                        <FormGroup>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                error={errorForm.phone?.error}
                                                placeholder="Số điện thoại"
                                                disabled={!apartmentCurrent}
                                                type="text"
                                                value={userData.phone}
                                                onChange={(e) =>
                                                    onChangeUserData("phone", e.target.value)
                                                }
                                            />
                                            {errorForm.phone?.error && <div className='text-error'>{errorForm.phone?.message}</div>}
                                        </FormGroup>
                                    </Row>
                                    <Row>
                                        <Label>
                                            Email
                                        </Label>
                                        <FormGroup>
                                            <Input
                                                id="email"
                                                name="email"
                                                error={errorForm.email?.error}
                                                placeholder="Email"
                                                disabled={!apartmentCurrent}
                                                type="text"
                                                value={userData.email}
                                                onChange={(e) =>
                                                    onChangeUserData("email", e.target.value)
                                                }
                                            />
                                            {errorForm.email?.error && <div className='text-error'>{errorForm.email?.message}</div>}
                                        </FormGroup>
                                    </Row>
                                    <Row>
                                        <Label>
                                            Địa chỉ
                                        </Label>
                                        <FormGroup>
                                            <Input
                                                id="address"
                                                name="address"
                                                error={errorForm.address?.error}
                                                placeholder="Địa chỉ"
                                                disabled={!apartmentCurrent}
                                                type="text"
                                                value={userData.address}
                                                onChange={(e) =>
                                                    onChangeUserData("address", e.target.value)
                                                }
                                            />
                                            {errorForm.address?.error && <div className='text-error'>{errorForm.address?.message}</div>}
                                        </FormGroup>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <Label>
                                                Ngày sinh
                                            </Label>
                                            <FormGroup>
                                                <DatePicker 
                                                    selected={userData.birthday} 
                                                    onChange={(date) => onChangeUserData("birthday", date)} 
                                                    placeholderText="Ngày sinh"
                                                    className="form-control"
                                                    selectsStart
                                                    maxDate={new Date()}
                                                    dateFormat="dd/MM/yyyy"
                                                    locale='vi'
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                            <Label>
                                                Giới tính
                                            </Label>
                                            <FormGroup>
                                                <Input
                                                    id="exampleSelect"
                                                    name="select"
                                                    type="select"
                                                    className='btn-select pointer-btn'
                                                    value={userData.sex}
                                                    onChange={(e) => onChangeUserData("sex", e.target.value)}
                                                >
                                                    <option value="" disabled selected hidden>Chọn giới tính</option>
                                                    <option key='Nam' value='Nam' >Nam</option>
                                                    <option key='Nữ' value='Nữ' >Nữ</option>
                                                </Input>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col md={4} className='d-flex align-items-center justify-content-center flex-column'>
                                    <Label>
                                        Ảnh đại diện
                                    </Label>
                                    <FormGroup className='d-flex align-items-center justify-content-center'>
                                        <ImageUploading
                                            multiple
                                            value={images}
                                            onChange={onUploadImage}
                                            maxNumber={1}
                                            dataURLKey="data_url"
                                            acceptType={['jpg', 'png']}
                                        >
                                            {({
                                                imageList,
                                                onImageUpload,
                                                onImageRemoveAll,
                                                onImageUpdate,
                                                onImageRemove,
                                                isDragging,
                                                dragProps,
                                            }) => (
                                                // write your building UI
                                                <div className="upload__image-wrapper">
                                                    {imageList.length ? imageList.map((image, index) => (
                                                        <div key={index} className="image-item">
                                                            <img src={image['data_url']} alt="" width="250px" height="250px" className='border border-primary'/>
                                                            <div className="d-flex flex-row justify-content-evenly">
                                                                <Button onClick={() => onImageUpdate(index)}>Chọn lại</Button>
                                                                <Button onClick={() => onImageRemove(index)}>Xóa ảnh</Button>
                                                            </div>
                                                        </div>
                                                    )) : <Button
                                                            style={{ width: "250px", height: "250px", borderStyle: "dashed" }}
                                                            // style={isDragging ? { color: 'red' } : undefined}
                                                            variant='outlined'
                                                            onClick={onImageUpload}
                                                            {...dragProps}
                                                        >
                                                            {!isDragging ? <div 
                                                                className='d-flex flex-column align-items-center justify-content-center'
                                                                // style={isDragging ? { color: 'red' } : undefined}
                                                            >
                                                                <MdFileUpload 
                                                                    style={{ fontSize: "150px"}}
                                                                />
                                                                Nhấn hoặc kéo ảnh vào đây
                                                            </div> : <div
                                                                className='d-flex flex-column align-items-center justify-content-center'
                                                            >
                                                                <MdFileUpload 
                                                                    style={{ fontSize: "150px"}}
                                                                />
                                                                Thả ảnh vào đây
                                                            </div>}
                                                        </Button>}
                                                    {/* <Button onClick={onImageRemoveAll}>Remove all images</Button> */}
                                                </div>
                                            )}
                                        </ImageUploading>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </TabPanel>
                        <TabPanel index={2} key={"2"} value={"2"}>
                            <Row>
                                <Col md={6}>
                                    <Label>Thông tin chung</Label>
                                    <Card style={{height: "500px"}}>
                                    <CardBody>
                                    <Row>
                                        <Col md={3}>
                                            <Label>
                                                Tên khu trọ
                                            </Label>
                                        </Col>
                                        <Col md={9}>
                                            <FormGroup>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    error={errorForm.name?.error}
                                                    placeholder="Tên khu trọ"
                                                    type="text"
                                                    disabled={!apartmentCurrent}
                                                    value={dataAdd.name}
                                                    onChange={(e) =>
                                                        onChangeData("name", e.target.value)
                                                    }
                                                />
                                                {errorForm.name?.error && <div className='text-error'>{errorForm.name?.message}</div>}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={3}>
                                            <Label>
                                                Số điện thoại liên hệ
                                            </Label>
                                        </Col>
                                        <Col md={9}>
                                            <FormGroup>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    error={errorForm.phone?.error}
                                                    placeholder="Số điện thoại"
                                                    disabled={!apartmentCurrent}
                                                    type="text"
                                                    value={dataAdd.phone}
                                                    onChange={(e) =>
                                                        onChangeData("phone", e.target.value)
                                                    }
                                                />
                                                {errorForm.phone?.error && <div className='text-error'>{errorForm.phone?.message}</div>}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={3}>
                                            <Label>
                                                Giá điện mặc định
                                            </Label>
                                        </Col>
                                        <Col md={9}>
                                            <FormGroup>
                                                <Input
                                                    id="electric_price"
                                                    name="electric_price"
                                                    error={errorForm.electric_price?.error}
                                                    placeholder="Giá điện"
                                                    disabled={!apartmentCurrent}
                                                    type="text"
                                                    value={dataAdd.electric_price ? dataAdd.electric_price.toLocaleString() : ""}
                                                    onChange={(e) =>
                                                        onChangeData("electric_price", e.target.value, true)
                                                    }
                                                />
                                                {errorForm.electric_price?.error && <div className='text-error'>{errorForm.electric_price?.message}</div>}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={3}>
                                            <Label>
                                                Giá nước mặc định
                                            </Label>
                                        </Col>
                                        <Col md={9}>
                                            <FormGroup>
                                                <Input
                                                    id="water_price"
                                                    name="water_price"
                                                    error={errorForm.water_price?.error}
                                                    placeholder="Giá nước"
                                                    disabled={!apartmentCurrent}
                                                    type="text"
                                                    value={dataAdd.water_price ? dataAdd.water_price.toLocaleString() : ""}
                                                    onChange={(e) =>
                                                        onChangeData("water_price", e.target.value, true)
                                                    }
                                                />
                                                {errorForm.water_price?.error && <div className='text-error'>{errorForm.water_price?.message}</div>}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    </CardBody>
                                        <CardFooter><Button
                                            disabled={!apartmentCurrent}
                                            className='float-end'
                                            onClick={() => updateApartment()}
                                        >
                                            Cập nhật
                                        </Button></CardFooter>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Row>
                                        <Row>
                                            <div>
                                                <Label>Danh sách dịch vụ</Label>
                                                <Button
                                                    disabled={!apartmentCurrent}
                                                    onClick={() => toggle_modal_add()}
                                                >
                                                    Thêm mới +
                                                </Button>
                                            </div>
                                        </Row>
                                        <div style={{ height: 500, width: '100%' }}>
                                            <DataGrid 
                                                disableRowSelectionOnClick 
                                                getRowId={(row) => row._id}
                                                columns={columns}
                                                rows={listService.map((item, index) => {
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
                                    </Row>
                                </Col>
                            </Row>
                        </TabPanel>
                        <TabPanel index={3} key={"3"} value={"3"}>
                            <Row>
                                <Col md={6}>
                                    <Row>
                                        <Col md={10}>
                                            <Label>
                                                Địa chỉ
                                            </Label>
                                            <FormGroup>
                                                <Input
                                                    id="address"
                                                    name="address"
                                                    error={errorForm.address?.error}
                                                    placeholder="Địa chỉ"
                                                    disabled={!apartmentCurrent}
                                                    type="text"
                                                    value={dataAdd.address}
                                                    onChange={(e) =>
                                                        onChangeData("address", e.target.value)
                                                    }
                                                />
                                                {errorForm.address?.error && <div className='text-error'>{errorForm.address?.message}</div>}
                                            </FormGroup>
                                        </Col>
                                        <Col md={2} className='d-flex align-items-center'>
                                            <Button
                                                onClick={() => get_location(dataAdd.address)}
                                                disabled={!apartmentCurrent}
                                            >
                                                Lấy vị trí
                                            </Button>
                                        </Col>
                                        <Row>
                                            {!location && <span>Vui lòng nhập địa chỉ và lấy vị trí hiện tại.</span>}
                                        </Row>
                                    </Row>
                                </Col>
                                <Col md={6}>
                                    <div className='map-container'>
                                        <MapBox
                                            _location={location}
                                            _setLocation={setLocation}
                                        />
                                    </div>
                                    {location && <span>Chọn vị trí chính xác bằng cách kéo dấu đỏ trên bản đồ.</span>}
                                </Col>
                            </Row>
                        </TabPanel>
                    </TabContext>
                </div>
            </CardBody>
                {tabSelected==2 && <CardFooter><Button
                    disabled={!apartmentCurrent}
                    className='float-end'
                    onClick={() => updateLocation()}
                >
                    Cập nhật
                </Button></CardFooter>}
                {tabSelected==1 && <CardFooter><Button
                    className='float-end'
                    onClick={() => updateUserData()}
                >
                    Cập nhật
                </Button></CardFooter>}
        </Card>

        {modalAdd && <ModalAddService
            _modal={modalAdd}
            _toggleModal={toggle_modal_add}
            _done_action={done_action}
        />}

        {modalDetailService && <ModalDetailService
            _modal={modalDetailService}
            _toggleModal={toggle_modal_detail_service}
            _dataSelect={serviceRow}
            _done_action={done_action}
        />}
    </div>)
}


export default Setting