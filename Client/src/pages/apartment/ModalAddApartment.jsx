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
import "./Apartment.scss";
import { TextField, Button, } from '@mui/material';
import { useSnackbar } from 'notistack';
import ImageUploading from 'react-images-uploading';
import { MdFileUpload } from "react-icons/md";
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';

const ModalAddApartment = (props) => {
	const { _modal, _toggleModal, _done_action } = props;
	const apartmentCurrent = useSelector((state) => state.apartment?.current) || get_local_storage("apartment", "")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [dataAdd, setDataAdd] = useState({})
	const [errorForm, setErrorForm] = useState({})
    const [imagesPreview, setImagesPreview] = useState();
    const [images, setImages] = useState([]);
    const [changed, setChanged] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        if (is_empty(dataAdd.name)) {
			return setErrorForm({
				"name": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (is_empty(dataAdd.phone)) {
			return setErrorForm({
				"phone": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        if (is_empty(dataAdd.address)) {
			return setErrorForm({
				"address": {
					"error": true,
					"message": "Không được để trống!"
				}
			})
		}
        const formData = new FormData()
        if (dataAdd.name) formData.append("name", dataAdd.name)
        if (dataAdd.phone) formData.append("phone", dataAdd.phone)
        if (dataAdd.address) formData.append("address", dataAdd.address)
        if (dataAdd.water_price) formData.append("water_price", dataAdd.water_price)
        if (dataAdd.electric_price) formData.append("electric_price", dataAdd.electric_price)
        if (images.length > 0) {
            for (let i in images) {
                formData.append("images-apartment", images[i]?.file)
            }
        }
        setLoading(true)
		const res = await http_request({ method: "POST", url: "cms/apartment/", data: formData, up_file: true })
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

    const pressEnterEvent = (event)=> {
        if (event.keyCode === 13) return onSubmit()
    }

	const onChangeData = (type, value) => {
        setErrorForm({})
		return setDataAdd({
			...dataAdd,
			[type]: value
		})
	}

    const onUploadImage = (imageList, addUpdateIndex) => {
        // data for submit
        setImages(imageList);
        setChanged(true)
    };

    return (<Fragment>
        <Modal 				
            isOpen={_modal}
            toggle={_toggleModal}
            className="modal-custom"
            size="xl"
        >
            <ModalHeader toggle={_toggleModal}>
                Thêm mới nhà trọ
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col md={6}>
                        <FormGroup>
                            <TextField
                                id="name"
                                name="name"
                                error={errorForm.name?.error}
                                fullWidth={true}
                                label="Tên nhà trọ"
                                type="text"
                                onChange={(e) =>
                                    onChangeData("name", e.target.value)
                                }
                            />
                            {errorForm.name?.error && <div className='text-error'>{errorForm.name?.message}</div>}
                        </FormGroup>
                        <FormGroup>
                            <TextField
                                id="phone"
                                name="phone"
                                error={errorForm.phone?.error}
                                fullWidth={true}
                                label="Số điện thoại liên hệ"
                                type="text"
                                onChange={(e) =>
                                    onChangeData("phone", e.target.value)
                                }
                            />
                            {errorForm.phone?.error && <div className='text-error'>{errorForm.phone?.message}</div>}
                        </FormGroup>
                        <FormGroup>
                            <TextField
                                id="address"
                                name="address"
                                error={errorForm.address?.error}
                                fullWidth={true}
                                label="Địa chỉ"
                                type="text"
                                onChange={(e) =>
                                    onChangeData("address", e.target.value)
                                }
                            />
                            {errorForm.address?.error && <div className='text-error'>{errorForm.address?.message}</div>}
                        </FormGroup>
                        <FormGroup>
                            <TextField
                                id="water_price"
                                name="water_price"
                                error={errorForm.water_price?.error}
                                fullWidth={true}
                                label="Giá tiền một số nước"
                                type="text"
                                onChange={(e) =>
                                    onChangeData("water_price", e.target.value)
                                }
                            />
                            {errorForm.water_price?.error && <div className='text-error'>{errorForm.water_price?.message}</div>}
                        </FormGroup>
                        <FormGroup>
                            <TextField
                                id="electric_price"
                                name="electric_price"
                                error={errorForm.water_price?.error}
                                fullWidth={true}
                                label="Giá tiền một số điện"
                                type="text"
                                onChange={(e) =>
                                    onChangeData("electric_price", e.target.value)
                                }
                                onKeyUp={pressEnterEvent}
                            />
                            {errorForm.electric_price?.error && <div className='text-error'>{errorForm.electric_price?.message}</div>}
                        </FormGroup>
                    </Col>
                    <Col md={6}>
                        <Card className='w-100 h-100 p-2'>
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
                                                <img src={image['data_url']} alt="" width="150px" height="150px" className='border border-primary'/>
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
    </Fragment>)
}

export default ModalAddApartment