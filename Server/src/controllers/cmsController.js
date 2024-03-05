import express from 'express';
import { handleRequest } from '../utils/index.js';
import * as UserActions from '../actions/UserActions.js';
import * as ApartmentActions from '../actions/ApartmentActions.js';
import * as RoomActions from '../actions/RoomActions.js';
import { verify } from '../middlewares/verifyMiddleware.js';
const router = express.Router();

//ping
router.get('/ping', verify(), handleRequest(UserActions.ping))

//Apartment
router.post('/apartment/', verify(), handleRequest(ApartmentActions.create))
router.put('/apartment/:id', verify(), handleRequest(ApartmentActions.update))
router.get('/apartments', verify(), handleRequest(ApartmentActions.list))
router.get('/apartment/:id', verify(), handleRequest(ApartmentActions.get))
router.delete('/apartment/:id', verify(), handleRequest(ApartmentActions.remove))

//Room Group
router.post('/room-group/', verify(), handleRequest(RoomActions.createRoomGroup))
router.put('/room-group/:id', verify(), handleRequest(RoomActions.updateRoomGroup))
router.get('/list-room-group', verify(), handleRequest(RoomActions.listRoomGroup))
router.get('/room-group/:id', verify(), handleRequest(RoomActions.getRoomGroup))
router.delete('/room-group/:id', verify(), handleRequest(RoomActions.removeRoomGroup))

//Room
router.post('/room/', verify(), handleRequest(RoomActions.create))
router.put('/room/:id', verify(), handleRequest(RoomActions.update))
router.get('/rooms', verify(), handleRequest(RoomActions.list))
router.get('/room/:id', verify(), handleRequest(RoomActions.get))
router.delete('/room/:id', verify(), handleRequest(RoomActions.remove))

export default router;