//package or module import
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan'); //서버 로그 모듈
const compression = require('compression'); //압축 성능 최적화 모듈
const helmet = require('helmet'); //보안 모듈
const hpp = require('hpp'); //http parameter pollution(HTTP 매개 변수 오염 공격으로부터 보호) 모듈
require('./passport'); //패스포트 설정
const Middleware = require('./middleware/Middleware'); //커스텀 미들웨어 모듈
const Util = require('./util/Util'); //유틸리티성 함수 모듈
require('dotenv').config(); //env 모듈
const logger = Util.logger(); //디버그 로그 모듈
const cors = require('cors');
//router import
const cobinhoodRouter = require('./routes/cobinhood');
const v1Router = require('./routes/v1.js');
//express set
const app = express();
//middleware set
app.use(Middleware.checkApiVer);//호출한 API Version의 유무 체크. (cobinhood oAuth callback URL에 version이 없어서 부득이 하게...주석처리)
app.use(morgan('combined'));
app.use(cors());
app.use(helmet());
app.use(hpp());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use('/auth/cobinhood', cobinhoodRouter); // 테스트 콜백 URL이 localhost:33000/auth/cobinhood/callback 으로 Fix 되어 있어서 설정을 맞춘 것.
app.use('/api/v1', v1Router); //라우터 연결.
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.status(err.status || 500);
  err.status = res.statusCode; //status에 statusCode 삽입.
  logger.error(Util.stringify(err));
  res.status(res.statusCode).json(err);
});
module.exports = app;