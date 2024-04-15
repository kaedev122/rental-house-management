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
import { useSnackbar } from 'notistack';
import ImageUploading from 'react-images-uploading';
import { MdFileUpload } from "react-icons/md";
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';

const ModalAddRoom = (props) => {
	const { _modal, _toggleModal, _done_action, _group_selected, _apartmentData } = props;
	const apartmentCurrent = useSelector((state) => state.apartment?.current) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [dataAdd, setDataAdd] = useState({
        water_price: _apartmentData.water_price,
        electric_price: _apartmentData.electric_price,
    })
	const [errorForm, setErrorForm] = useState({})
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [changed, setChanged] = useState(false);
    const [showImage, setShowImage] = useState(false);
    const toggle_modal_image = (image) => {
        setImagesPreview(image)
        return setShowImage(!showImage)
    }

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
        formData.append("apartment", apartmentCurrent)
        formData.append("group", _group_selected)
        if (images.length > 0) {
            for (let i in images) {
                formData.append("images-room", images[i]?.file)
            }
        }
        setLoading(true)
		const res = await http_request({ method: "POST", url: "cms/room/", data: formData, up_file: true })
		const { code, data, message } = res
        setLoading(false)
        if (is_empty(res)) {
            return enqueueSnackbar("Có lỗi đã xảy ra!", {
                variant: "error",
                autoHideDuration: 5000,
            })
		}
        if (code === 200) {
            enqueueSnackbar("Thêm mới thành công", {
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
        setImages(imageList);
        setChanged(true)
    };

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

    return (<Fragment>
        <Modal 				
            isOpen={_modal}
            toggle={_toggleModal}
            className="modal-custom"
            size="xl"
        >
            <ModalHeader toggle={_toggleModal}>
                Thêm mới phòng
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
                    </Col>
                    <Col md={7}>
                        <Card className='w-100 h-100 p-2'>
                            <CardHeader>
                                <h5 className='m-0'>Hình ảnh phòng</h5>
                            </CardHeader>
                            <CardBody>
                                <ImageUploading
                                    multiple
                                    value={images}
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
                                                        <Button onClick={() => onImageUpdate(index)}>Chọn lại</Button>
                                                        <Button onClick={() => onImageRemove(index)}>Xóa ảnh</Button>
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
            </ModalBody>
            <ModalFooter>
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
            </ModalFooter>
        </Modal>
        {showImage && <ShowImage
            _modalImage={showImage}
            _toggleModalImage={toggle_modal_image}
            _image={imagesPreview}
        />}
    </Fragment>)
}

export default ModalAddRoom