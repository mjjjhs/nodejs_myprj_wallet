const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const Util = require('../util/Util'); //유틸리티성 함수 모듈
require('dotenv').config(); //env 모듈
const Middleware = class Middleware {
  constructor(...args) {}
  /**
   * @description 사용자가 요청한 api url의 version을 체크한다.
   * @author jhmoon
   * @date 2018-11-23
   * @param {object} req 리퀘스트 데이터
   * @param {object} res 리스폰스 데이터
   * @param {function} next 다음 미들웨어로 넘어가는 함수
   * @returns {function}
   */
  checkApiVer(req, res, next) {
    if(req.originalUrl.split('/')[1] === 'auth' && req.originalUrl.split('/')[2] === 'cobinhood') { // /auth/cobinhood 로 시작하는 api는 패스 (코빈후드용 api)
      return next();
    }
    const callVer = req.originalUrl.split('/')[2];
    const result = process.env.API_VERSIONS.split(',').filter(apiVer => apiVer === callVer);
    if (result.length) {
      return next();
    }
    return next(createError(404));
  }
  /**
   * @description Token을 비교하여 이상유무를 리턴한다.
   * @author jhmoon
   * @date 2018-12-10
   * @param {object} req 리퀘스트 객체
   * @param {object} res 리스폰스 객체
   * @param {function} next 다음 미들웨어로 넘어가는 함수
   * @returns {json}
   */
  verifyToken(req, res, next) {
    try {
      req.decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.SECRET);
      return next();
    } catch(err) {
      let rv = null;
      if(err.name === 'TokenExpiredError') { //토큰 유효기간 초과
        rv = Util.getReturnValue(419, 'TOKEN_EXPIRED');
        return res.status(200).json(rv);
      }
      rv = Util.getReturnValue(401, 'INVALID_TOKEN');
      return res.status(200).json(rv);
    }
  }
  /**
   * @description 로그인 체크. 로그인 중에만 접근할 수 있을 때
   * @author jhmoon
   * @date 2018-11-29
   * @param {object} req request 객체
   * @param {object} res response 객체
   * @param {function} next 다음 미들웨어로 넘어가는 함수
   * @returns {function}
   */
  isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) { //로그인 중이면 다음 미들웨어 실행
      return next();
    }
    return next(createError(401)); //비로그인 중이면 401 에러
  }
  /**
   * @description 비로그인 체크. 비로그인 중에만 접근할 수 있을 때
   * @author jhmoon
   * @date 2018-11-29
   * @param {object} req request 객체
   * @param {object} res response 객체
   * @param {function} next 다음 미들웨어로 넘어가는 함수
   * @returns {function}
   */
  isNotLoggedIn(req, res, next) {
    if(!req.isAuthenticated()) { //비로그인 중이면 다음 미들웨어 실행
      return next();
    }
    return next(createError(401)); //로그인 중이면 401 에러
  }
};
module.exports = new Middleware();