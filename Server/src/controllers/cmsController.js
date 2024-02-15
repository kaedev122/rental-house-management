import express from 'express';
import { handleRequest } from '../utils/index.js';
import * as UserActions from '../actions/UserActions.js';
import { verify } from '../middlewares/verifyMiddleware.js';
const router = express.Router();

router.get('/ping', verify(), handleRequest(UserActions.ping))

export default router;
