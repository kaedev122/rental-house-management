import express from 'express';
import { handleRequest } from '../utils/index.js';
import * as AuthActions from '../actions/UserActions.js';

const router = express.Router();

router.get('/ping', handleRequest(AuthActions.ping))
router.post('/register', handleRequest(AuthActions.create))
router.post('/active/:code', handleRequest(AuthActions.active))

export default router;
