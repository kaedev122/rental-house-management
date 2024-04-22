import express from 'express';
import { handleRequest } from '../utils/index.js';
import * as UserActions from '../actions/UserActions.js';
import * as AdminActions from '../actions/AdminActions.js';
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

// User
router.get('/users/', verify(["admin"]), handleRequest(AdminActions.list))
router.get('/user/:id', verify(["admin"]), handleRequest(AdminActions.get))
router.put('/user/:id', verify(["admin"]), handleRequest(AdminActions.update))

// Script
router.get('/update-role-user/', verify(["admin"]), handleRequest(AdminActions.updateRoleUser))

export default router;