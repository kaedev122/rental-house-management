import React, { Fragment, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Col, Row, Modal, ModalHeader, ModalBody, Label, ModalFooter, FormGroup } from 'reactstrap'
import { http_request, get_local_storage, is_empty, } from '@utils'
import { format_date_time } from '@utils/format_time'
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FaBed, FaPhoneAlt, FaMoneyBillWaveAlt   } from "react-icons/fa";
import { IoPerson, IoPeopleSharp, IoWaterSharp } from "react-icons/io5";
import { RiWaterFlashFill } from "react-icons/ri";
import { BsPersonCircle, BsLightningChargeFill } from "react-icons/bs";
import { FaDollarSign, FaHandshakeSimple, FaHandshakeSimpleSlash } from "react-icons/fa6";
import "./Home.scss";
import { TextField, Button, } from '@mui/material';
import { ShowImage } from "@components"
import { useSnackbar } from 'notistack';
import ImageUploading from 'react-images-uploading';
import { MdFileUpload } from "react-icons/md";
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';

const ModalDetailRoom = (props) => {
	const { _modal, _toggleModal, _done_action, _dataSelect, _apartmentData } = props;
    console.log(_dataSelect)
	const apartmentCurrent = useSelector((state) => state.apartment?.current) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [dataAdd, setDataAdd] = useState({
        ..._dataSelect,
        images: _dataSelect.images ? _dataSelect.images : []
    })
	const [errorForm, setErrorForm] = useState({})
    const [images, setImages] = useState([]);
    const [roomImages, setRoomImages] = useState(_dataSelect.images ? _dataSelect.images.map(item => ({data_url: item})) : [])
    const [loading, setLoading] = useState(false);
    const [changed, setChanged] = useState(false);
    const [imagesPreview, setImagesPreview] = useState("");

    const [showImage, setShowImage] = useState(false);
    const toggle_modal_image = (image) => {
        setImagesPreview(image)
        return setShowImage(!showImage)
    }

    useEffect(() => {
        console.log(roomImages)
    }, [roomImages])

    const onSubmit = async () => {
        if (is_empty(dataAdd.name)) {
			return setErrorForm({
				"name": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        const formData = new FormData()
        if (dataAdd.name) formData.append("name", dataAdd.name)
        if (dataAdd.room_price) formData.append("room_price", dataAdd.room_price)
        if (dataAdd.electric_price) formData.append("electric_price", dataAdd.electric_price)
        if (dataAdd.water_price) formData.append("water_price", dataAdd.water_price)
        if (dataAdd.area) formData.append("area", dataAdd.area)
        if (changed) {
            if (roomImages.length > 0) {
                for (let i in roomImages) {
                    if (roomImages[i].file) formData.append("images-room", roomImages[i]?.file)
                }
            }
        }
        formData.append("images", dataAdd.images)
        setLoading(true)
		const res = await http_request({ method: "PUT", url: `cms/room/${_dataSelect._id}`, data: formData, up_file: true })
		const { code, data, message } = res
        setLoading(false)

        if (is_empty(res)) {
            return enqueueSnackbar("Có lỗi đã xảy ra!", {
                variant: "error",
                autoHideDuration: 5000,
            })
		}
        if (code === 200) {
            enqueueSnackbar("Cập nhật thành công", {
                variant: "success",
                autoHideDuration: 5000,
            })
            return _done_action()
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }
    
    const onUploadImage = (imageList, addUpdateIndex) => {
        // data for submit
        setRoomImages(imageList);
        setChanged(true)
    };

    const deleteRoom = async () => {
		const res = await http_request({ method: "DELETE", url: `cms/room/${_dataSelect._id}`})
		const { code, data, message } = res
        if (is_empty(res)) {
            return enqueueSnackbar("Có lỗi đã xảy ra!", {
                variant: "error",
                autoHideDuration: 5000,
            })
		}
        if (code === 200) {
            enqueueSnackbar("Xóa phòng thành công", {
                variant: "success",
                autoHideDuration: 5000,
            })
            return _done_action()
        }
        if (code === 500) {
            enqueueSnackbar(message, {
                variant: "error",
                autoHideDuration: 5000,
            })
        }
    }

    const pressEnterEvent = (event)=> {
        if (event.keyCode === 13) return onSubmit()
    }

	const onChangeData = (type, value, isNumber) => {
        setErrorForm({})
		if (isNumber) {
			const result = value.replace(/\D/g, "");
			return setDataAdd({
				...dataAdd,
				[type]: parseInt(result) || '',
			});
		}
        console.log(dataAdd)
		return setDataAdd({
			...dataAdd,
			[type]: value
		})
	}

    const removeOldImage = (index) => {
        let image = roomImages[index]
        let newListImages = dataAdd.images.filter((item, i) => {
            return item !== image.data_url
        })
        setDataAdd({
            ...dataAdd,
            images: newListImages
        })
    }

    return (<Fragment>
        <Modal 				
            isOpen={_modal}
            toggle={_toggleModal}
            className="modal-custom"
            size="xl"
        >
            <ModalHeader toggle={_toggleModal}>
                Cập nhật phòng
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col md={5}>
                        <FormGroup>
                            <TextField
                                id="name"
                                name="name"
                                error={errorForm.name?.error}
                                fullWidth={true}
                                label="Tên phòng"
                                type="text"
                                value={dataAdd.name}
                                onChange={(e) =>
                                    onChangeData("name", e.target.value)
                                }
                                />
                            {errorForm.name?.error && <div className='text-error'>{errorForm.name?.message}</div>}
                        </FormGroup>
                        <FormGroup>
                            <TextField
                                id="room_price"
                                name="room_price"
                                error={errorForm.room_price?.error}
                                fullWidth={true}
                                label="Giá phòng"
                                type="text"
                                value={dataAdd.room_price ? dataAdd.room_price.toLocaleString() : ""}
                                onChange={(e) =>
                                    onChangeData("room_price", e.target.value, true)
                                }
                                />
                            {errorForm.room_price?.error && <div className='text-error'>{errorForm.room_price?.message}</div>}
                        </FormGroup>
                        <FormGroup>
                            <TextField
                                id="electric_price"
                                name="electric_price"
                                error={errorForm.electric_price?.error}
                                fullWidth={true}
                                label={`Giá trên một số điện (Mặc định: ${_apartmentData.electric_price ? _apartmentData.electric_price.toLocaleString() : ""})`}
                                type="text"
                                value={dataAdd.electric_price ? dataAdd.electric_price.toLocaleString() : ""}
                                onChange={(e) =>
                                    onChangeData("electric_price", e.target.value, true)
                                }
                                />
                            {errorForm.electric_price?.error && <div className='text-error'>{errorForm.electric_price?.message}</div>}
                        </FormGroup>
                        <FormGroup>
                            <TextField
                                id="water_price"
                                name="water_price"
                                error={errorForm.water_price?.error}
                                fullWidth={true}
                                label={`Giá trên một số nước (Mặc định: ${_apartmentData.water_price ? _apartmentData.water_price.toLocaleString() : ""})`}
                                type="text"
                                value={dataAdd.water_price ? dataAdd.water_price.toLocaleString() : ""}
                                onChange={(e) =>
                                    onChangeData("water_price", e.target.value, true)
                                }
                                onKeyUp={pressEnterEvent}
                                />
                            {errorForm.water_price?.error && <div className='text-error'>{errorForm.water_price?.message}</div>}
                        </FormGroup>
                        <FormGroup>
                            <TextField
                                id="area"
                                name="area"
                                error={errorForm.area?.error}
                                fullWidth={true}
                                label={`Diện tích m2`}
                                type="text"
                                value={dataAdd.area ? dataAdd.area.toLocaleString() : ""}
                                onChange={(e) =>
                                    onChangeData("area", e.target.value, true)
                                }
                                onKeyUp={pressEnterEvent}
                                />
                            {errorForm.area?.error && <div className='text-error'>{errorForm.area?.message}</div>}
                        </FormGroup>
                    </Col>
                    <Col md={7}>
                        <Card className='w-100 h-100 p-2'>
                            <CardHeader>
                                <h5 className='m-0'>Hình ảnh phòng</h5>
                            </CardHeader>
                            <CardBody>
                                <ImageUploading
                                    multiple
                                    value={roomImages}
                                    onChange={onUploadImage}
                                    maxNumber={6}
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
                                        <div className="d-flex flex-row flex-wrap">
                                            { imageList.map((image, index) => (
                                                <div key={index} className="image-item">
                                                    <img onClick={() => toggle_modal_image(image)} src={image['data_url']} alt="" width="150px" height="150px" className='border border-primary'/>
                                                    <div className="justify-content-evenly">
                                                        <Button onClick={() => {
                                                            onImageUpdate(index)
                                                            removeOldImage(index)
                                                        }}>Chọn lại</Button>
                                                        <Button onClick={() => {
                                                            removeOldImage(index)
                                                            onImageRemove(index)
                                                        }}>Xóa ảnh</Button>
                                                    </div>
                                                </div>
                                            )) }
                                            {imageList.length <= 5 ? <Button
                                                style={{ width: "150px", height: "150px", borderStyle: "dashed" }}
                                                // style={isDragging ? { color: 'red' } : undefined}
                                                variant='outlined'
                                                onClick={onImageUpload}
                                                {...dragProps}
                                            >
                                                {!isDragging ? <div 
                                                    className='d-flex flex-column align-items-center justify-content-center'
                                                    // style={isDragging ? { color: 'red' } : undefined}
                                                    style={imageList.length > 5 ? { display: "none"} : undefined}
                                                >
                                                    <MdFileUpload 
                                                        style={{ fontSize: "50px"}}
                                                    />
                                                    Nhấn hoặc kéo ảnh vào đây
                                                </div> : <div
                                                    className='d-flex flex-column align-items-center justify-content-center'
                                                    style={imageList.length > 5 ? { display: "none"} : undefined}
                                                >
                                                    <MdFileUpload 
                                                        style={{ fontSize: "50px"}}
                                                    />
                                                    Thả ảnh vào đây
                                                </div>}
                                            </Button> : ""}
                                            {/* <Button onClick={onImageRemoveAll}>Remove all images</Button> */}
                                        </div>
                                    )}
                                </ImageUploading>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <div className='mt-2 text-end fst-italic'>(Các dữ liệu trên phục vụ cho mục đích quảng bá nhà trọ của bạn)</div>
            </ModalBody>
            <ModalFooter className='justify-content-between'>
                <div>
                    <Button
                        className="btn-custom save"
                        variant="contained"
                        color='error'
                        onClick={() => deleteRoom()}
                    >
                        Xóa
                    </Button>
                </div>
                <div>
                    <Button className="btn-custom cancel" onClick={_toggleModal}>
                        Hủy bỏ
                    </Button>
                    {!loading ? <Button
                        className="btn-custom save"
                        variant="contained"
                        onClick={onSubmit}
                    >
                        Lưu
                    </Button> : <LoadingButton
                        loading
                        loadingPosition="start"
                        startIcon={<SaveIcon />}
                        className="btn-custom save"
                        variant="contained"
                    >
                        Lưu
                    </LoadingButton>}
                </div>
            </ModalFooter>
        </Modal>

        {showImage && <ShowImage
            _modalImage={showImage}
            _toggleModalImage={toggle_modal_image}
            _image={imagesPreview}
        />}
    </Fragment>)
}

export default ModalDetailRoom