import React, { Fragment, useEffect, useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { Card, CardHeader, CardBody, CardFooter, Col, Row, Modal, ModalHeader, ModalBody, Label, ModalFooter, FormGroup, Input, Table } from 'reactstrap'
import { TextField, Button, } from '@mui/material';
import html2canvas from 'html2canvas';
import { http_request, get_local_storage, is_empty, } from '@utils'
import { BsHouse } from "react-icons/bs";
import { format_date_time, format_full_time } from '@utils/format_time';
import moment from 'moment-timezone';
import 'moment/locale/vi'; 
moment().tz("Asia/Ho_Chi_Minh").format();
moment.locale('vi')

const ExportBill = (props) => {
    const { _data, _apartment } = props;
    console.log(_data)

    const [modal, setModal] = useState(false);
    const [apartmentData, setApartmentData] = useState({});
    const [customerData, setCustomerData] = useState({});
    const toggleModal = async () => {
        await setModal(!modal);
        if (modal !== true) await handleDownloadImage()
    }

    useEffect(() => {
        get_apartment_data()
        get_customer_data()
    }, [])

    const handleDownloadImage = async () => {
        const element = document.getElementById('print'),
        canvas = await html2canvas(element),
        data = canvas.toDataURL('image/jpg'),
        link = document.createElement('a');
    
        link.href = data;
        link.download = `${_data.room.name}-${_data.contract.code}-${moment(_data.createdAt).format("MM-YYYY")}.jpg`;
    
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const get_apartment_data = async () => {
        const res = await http_request({method: "GET", url:`cms/apartment/${_apartment}`})
		const { code, data, message } = res
        if (code == 200) {
            console.log(data)
            setApartmentData(data)
            return true
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

    const get_customer_data = async () => {
        const res = await http_request({method: "GET", url:`cms/customer/${_data.contract.customer_represent}`})
		const { code, data, message } = res
        console.log(data)
        if (code == 200) {
            setCustomerData(data)
            return true
        }
        return enqueueSnackbar(message, {
            variant: "error",
            autoHideDuration: 5000,
        })
    }

    return (<Fragment>
        <Button
            className="btn-custom save float-end mb-2"
            variant="contained"
            onClick={() => {
                toggleModal()
            }}
        >
            Xuất hóa đơn
        </Button>
        <Modal
            isOpen={modal}
            toggle={toggleModal}
            className="modal-custom"
            size="xl"
        >
            <div id="print">
                <Card>
                    <CardHeader>
                        <Label className="d-flex justify-content-center align-items-center text-center fs-4 fw-bolder">MÃ HÓA ĐƠN - {_data.code}</Label>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col md={2}>
                                <div className='d-flex align-items-center justify-content-center'>
                                    <BsHouse 
                                        style={{fontSize: '120'}}
                                    />
                                </div>
                            </Col>
                            <Col md={8}>
                                <Row><Label className='fs-5 fw-bold'>{apartmentData?.name}</Label></Row>
                                <Row><Label className='fs-6 fw-bold'>Địa chỉ: {apartmentData?.address}</Label></Row>
                                <Row><Label className=''>Quản lý: {apartmentData?.user?.fullname} - SĐT: {apartmentData?.phone}</Label></Row>
                            </Col>
                            <Col md={2}>
                                <div className='w-100 h-100'>
                                    QR thanh toán
                                </div>
                            </Col>
                        </Row>
                        <Row className='mt-4'>
                            <Table
                                bordered
                            >
                                <tbody>
                                    <tr>
                                        <th colSpan="6">
                                            <span className='fw-bold'>1. Thông tin khách thuê</span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <td colSpan="2">
                                            <span className=''>Tên khách thuê: {customerData?.fullname}</span>
                                        </td>
                                        <td colSpan="2">
                                            <span className=''>SĐT: {customerData?.phone || "---"}</span>
                                        </td>
                                        <td>
                                            <span className=''>Mã hợp đồng: <span className='fw-bold'>{_data?.contract?.code}</span></span>
                                        </td>
                                        <td>
                                            <span className=''>Phòng: <span className='fw-bold'>{_data?.room?.name}</span></span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="4">
                                            <span className=''>Địa chỉ: {customerData?.address || "---"}</span>
                                        </td>
                                        <td colSpan="2">
                                            <span className=''>Ngày sinh: {customerData.birthday ? format_date_time(customerData.birthday) : "---"}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan="6">
                                            <span className='fw-bold'>2. Tiền điện nước</span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <td>
                                            
                                        </td>
                                        <td>
                                            Kỳ này
                                        </td>
                                        <td>
                                            Kỳ trước
                                        </td>
                                        <td>
                                            Đã sử dụng
                                        </td>
                                        <td>
                                            Giá một số
                                        </td>
                                        <td>
                                            <span className='fw-bold'>Thành tiền</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Số nước
                                        </td>
                                        <td>
                                            {_data?.water_number}
                                        </td>
                                        <td>
                                            {_data?.last_water_number}
                                        </td>
                                        <td>
                                            {_data?.water_used}
                                        </td>
                                        <td>
                                            <span>{_data?.water_price.toLocaleString()} đ</span>
                                        </td>
                                        <td>
                                            <span className='fw-bold'>{_data?.water_total.toLocaleString()} đ</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Số điện
                                        </td>
                                        <td>
                                            {_data?.electric_number}
                                        </td>
                                        <td>
                                            {_data?.last_electric_number}
                                        </td>
                                        <td>
                                            {_data?.electric_used}
                                        </td>
                                        <td>
                                            <span>{_data?.electric_price.toLocaleString()} đ</span>
                                        </td>
                                        <td>
                                            <span className='fw-bold'>{_data?.electric_total.toLocaleString()} đ</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5" className='text-end'>
                                            <span className='fw-bold'>Tổng tiền điện nước</span>
                                        </td>
                                        <td>
                                            <span className='fw-bold'>{(_data?.water_total + _data?.electric_total).toLocaleString()} đ</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan="6">
                                            <span className='fw-bold'>3. Tiền dịch vụ</span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <td>
                                            STT
                                        </td>
                                        <td colSpan="2">
                                            Tên dịch vụ
                                        </td>
                                        <td>
                                            Số lượng
                                        </td>
                                        <td>
                                            Giá dịch vụ
                                        </td>
                                        <td>
                                        </td>
                                    </tr>
                                    {_data.other_price.length ? (_data.other_price.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td width={80}>
                                                    {index + 1}
                                                </td>
                                                <td colSpan="2">
                                                    {item.name}
                                                </td>
                                                <td>
                                                    {item.number}
                                                </td>
                                                <td>
                                                    {item.price.toLocaleString()} đ
                                                </td>
                                                <td>
                                                <span className='fw-bold'>{(item.number * item.price).toLocaleString()} đ</span>
                                                </td>
                                            </tr>
                                        )
                                    })) : <tr>
                                        <td className="text-center" colSpan="6">
                                            Không có dịch vụ nào
                                        </td>
                                    </tr>}
                                    <tr>
                                        <td colSpan="5" className='text-end'>
                                            <span className='fw-bold'>Tổng tiền dịch vụ</span>
                                        </td>
                                        <td>
                                            <span className='fw-bold'>{(_data?.total_other_price).toLocaleString()} đ</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan="6">
                                            <span className='fw-bold'>4. Tiền phòng & Chi phí khác</span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <td colSpan="4" rowSpan="3">
                                            Ghi chú: {_data?.note || "---"}
                                        </td>
                                        <td className='text-end'>
                                            <span className='fw-bold'>Tổng tiền phòng</span>
                                        </td>
                                        <td>
                                            <span className='fw-bold'>{(_data.room_price).toLocaleString()} đ</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='text-end'>
                                            <span className='fw-bold'>Chi phí phát sinh</span>
                                        </td>
                                        <td>
                                            <span className='fw-bold'>{(_data.cost_incurred).toLocaleString()} đ</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='text-end'>
                                            <span className='fw-bold'>Giảm giá</span>
                                        </td>
                                        <td>
                                            <span className='fw-bold'>- {(_data.discount).toLocaleString()} đ</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="6"></td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5" className='text-end'>
                                            <span className='fw-bold'>Tổng tiền phải trả</span>
                                        </td>
                                        <td>
                                            <span className='fw-bolder fs-3 text text-error'>{(_data.total).toLocaleString()} đ</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Row>
                        <Row className='float-end'>
                            <Label>Ngày tạo hóa đơn: {format_full_time(_data.createdAt)}</Label>
                        </Row>
                    </CardBody>
                    <CardFooter>
                        <p className="text-center">Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
                    </CardFooter>
                </Card>

            </div>
        </Modal>
    </Fragment>
    );
};

export default ExportBill;