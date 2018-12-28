const express = require('express');
const router = express.Router();
const Middleware = require('../middleware/Middleware'); //미들웨어 모듈
const userRouter = require('./v1/user'); //사용자 관련 API
const authRouter = require('./v1/auth'); //사용자 인증 및 회원가입, 로그아웃 API
router.use('/auth', authRouter);
router.use('/user', Middleware.verifyToken, userRouter);
module.exports = router;