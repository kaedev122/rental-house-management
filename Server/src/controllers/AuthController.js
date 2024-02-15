import express from 'express';
import { handleRequest } from '../utils/index.js';
import * as UserActions from '../actions/UserActions.js';
import { verify, verifyRecovery } from '../middlewares/verifyMiddleware.js';

const router = express.Router();

router.post('/register', handleRequest(UserActions.create))
router.post('/resend-email', handleRequest(UserActions.resendEmail))
router.post('/active/:code', handleRequest(UserActions.active))
router.post('/login', handleRequest(UserActions.login))
router.post('/send-email-recovery', handleRequest(UserActions.sendEmailRecoveryPassword))
router.post('/password-recovery', handleRequest(UserActions.recoveryPassword))
router.post('/new-password', verifyRecovery(), handleRequest(UserActions.newPassword))

export default router;
