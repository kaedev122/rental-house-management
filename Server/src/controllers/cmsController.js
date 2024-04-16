import express from 'express';
import { handleRequest } from '../utils/index.js';
import * as UserActions from '../actions/UserActions.js';
import * as ApartmentActions from '../actions/ApartmentActions.js';
import * as RoomActions from '../actions/RoomActions.js';
import * as ContractActions from '../actions/ContractActions.js';
import * as CustomerActions from '../actions/CustomerActions.js';
import * as ServiceActions from '../actions/ServiceActions.js';
import * as BillActions from '../actions/BillActions.js';
import * as RevenueActions from '../actions/RevenueActions.js';
import * as ReportActions from '../actions/ReportActions.js';
import * as DefaultDataActions from '../actions/DefaultDataActions.js';
import { verify } from '../middlewares/verifyMiddleware.js';
import { uploadImage } from '../middlewares/uploadMiddleware.js';
const router = express.Router();

//ping
router.post('/ping', verify(), uploadImage.single('image-room'), handleRequest(UserActions.ping))

//Apartment
router.post('/apartment/', verify(), uploadImage.array("images-apartment", 6), handleRequest(ApartmentActions.create))
router.put('/apartment/:id', verify(), uploadImage.array("images-apartment", 6), handleRequest(ApartmentActions.update))
router.get('/apartments', verify(), handleRequest(ApartmentActions.list))
router.get('/apartment/:id', verify(), handleRequest(ApartmentActions.get))
router.delete('/apartment/:id', verify(), handleRequest(ApartmentActions.remove))

//Room Group
router.post('/room-group/', verify(), handleRequest(RoomActions.createRoomGroup))
router.put('/room-group/:id', verify(), handleRequest(RoomActions.updateRoomGroup))
router.get('/list-room-group', verify(), handleRequest(RoomActions.listRoomGroup))
router.get('/room-group/:id', verify(), handleRequest(RoomActions.getRoomGroup))
router.get('/room-group-extend', verify(), handleRequest(RoomActions.listRoomGroupExtend))
router.delete('/room-group/:id', verify(), handleRequest(RoomActions.removeRoomGroup))

//Room
router.post('/room/', verify(), uploadImage.array('images-room', 6), handleRequest(RoomActions.create))
router.put('/room/:id', verify(), uploadImage.array('images-room', 6), handleRequest(RoomActions.update))
router.get('/rooms', verify(), handleRequest(RoomActions.list))
router.get('/room/:id', verify(), handleRequest(RoomActions.get))
router.delete('/room/:id', verify(), handleRequest(RoomActions.remove))

//Contract
router.post('/contract/', verify(), handleRequest(ContractActions.create))
router.post('/end-contract/:id', verify(), handleRequest(ContractActions.endContract))
router.put('/contract/:id', verify(), handleRequest(ContractActions.update))
router.get('/contracts', verify(), handleRequest(ContractActions.list))
router.get('/contract/:id', verify(), handleRequest(ContractActions.get))
router.delete('/contract/:id', verify(), handleRequest(ContractActions.remove))

//Customer
router.post('/customer/', verify(), handleRequest(CustomerActions.create))
router.put('/customer/:id', verify(), handleRequest(CustomerActions.update))
router.get('/customers', verify(), handleRequest(CustomerActions.list))
router.get('/customer/contract', verify(), handleRequest(CustomerActions.listAdd))
router.get('/customer/:id', verify(), handleRequest(CustomerActions.get))
router.delete('/customer/:id', verify(), handleRequest(CustomerActions.remove))

//Setting - Service
router.post('/setting/service', verify(), handleRequest(ServiceActions.create))
router.put('/setting/service/:id', verify(), handleRequest(ServiceActions.update))
router.get('/setting/services', verify(), handleRequest(ServiceActions.list))
router.get('/setting/service/:id', verify(), handleRequest(ServiceActions.get))
router.delete('/setting/service/:id', verify(), handleRequest(ServiceActions.remove))

//Bill
router.post('/bill/', verify(), handleRequest(BillActions.create))
router.put('/bill/:id', verify(), handleRequest(BillActions.update))
router.get('/bills', verify(), handleRequest(BillActions.list))
router.get('/bill/:id', verify(), handleRequest(BillActions.get))
router.delete('/bill/:id', verify(), handleRequest(BillActions.closeBill))
router.post('/pay-bill/:id', verify(), handleRequest(BillActions.payBill))

//Revenue
router.get('/revenues', verify(), handleRequest(RevenueActions.list))
router.get('/revenue-total', verify(), handleRequest(RevenueActions.total))

//Report
router.get('/report-debt', verify(), handleRequest(ReportActions.getDebtReport))
router.get('/report-income', verify(), handleRequest(ReportActions.getIncomeReport))

//Default Data
router.get('/default-data/bank', verify(), handleRequest(DefaultDataActions.listBank))

//Script
// router.get('/script', handleRequest(bank.insertBank))

export default router;