const express = require('express');
const passport = require('passport'); //인증 모듈
const Util = require('../../util/Util'); //유틸리티성 함수 모듈
const Db = require('../../database/Mysql'); //데이터베이스 관련 함수 모듈
const Middleware = require('../../middleware/Middleware'); //미들웨어 모듈
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const router = express.Router();
require('dotenv').config(); //env 모듈
/**
 * @description 사용자의 회원가입
 * @author jhmooon
 * @date 2018-11-23
 *
 * @param {string} email 사용자 ID(email)
 * @param {string} pw 사용자 pw
 * @param {string} firstName 사용자 이름
 * @param {string} lastName 사용자 성
 * @param {string} nationality 사용자 국가 code
 * @param {string} nationalPhoneCode 사용자 E_164 code
 * @param {string} mobileNum 사용자 모바일 번호
 */
router.post('/join', Middleware.isNotLoggedIn, async (req, res, next) => { //비로그인시에
  Util.setLog('info', `user join api call:: ${Util.stringify(req.body)}`);
  const { email, pw, firstName, lastName } = req.body;
  let rv = null;
  try {
    const userData = await Db.sendQuery(Db.getQeury('findUserByEmail', email));
    if (userData && userData.length) { // 사용자 계정이 있으면 중복 계정 알림.
      Util.setLog('info', `user join api response:: There is already an account -> ${email}`);
      rv = Util.getReturnValue(600, 'ALREADY_ACCOUNT');
      return res.status(200).json(rv);
    }
    // 회원 가입 쿼리
    const pwHash = await bcrypt.hash(pw, 12); //단방향 암호화
    const insertResult = await Db.sendQuery(Db.getQeury('addUser', email, pwHash, firstName, lastName));
    if(!insertResult || !insertResult.affectedRows){
      Util.setLog('error', `add user failed!!`);
      rv = Util.getReturnValue(500, 'ERROR_JOIN_FAILED_ADD_USER');
      return res.status(200).json(rv);
    }
    rv = Util.getReturnValue(200, 'RESPONSE_CODE_OK', { email, firstName, lastName });
    Util.setLog('info', `user join api success!! -> ${Util.stringify(rv)}`);
    return res.status(200).json(rv);
  } catch (err) {
    Util.setLog('error', `user join api error:: ${err}`);
    rv = Util.getReturnValue(500, 'ERROR_JOIN');
    return res.status(200).json(rv);
  }
});
/**
 * @description 사용자의 로그인. 로그인 프로세스 중 패스포트 인증 절차를 거쳐 JWT 토큰을 부여 받아 사용자 테이블에 매핑.
 * @author jhmooon
 * @date 2018-12-11
 *
 * @param {string} id 사용자 ID(email)
 * @param {string} pw 사용자 pw
 *
 */
router.post('/login', (req, res, next) => {
  console.log(`LOGIN Start!!`);
  let rv = null;
  passport.authenticate('local', { session: false }, (authError, user, info) => {
    Util.setLog('info', `passport login callback func start!! -> ${Util.stringify(user)}`);
    if (authError) {
      return next(authError);
    }
    if (!user) {
      rv = Util.getReturnValue(400, info.message);
      return res.status(200).json(rv);
    }
    return req.login(user, { session: false }, async (loginError) => {
      if (loginError) {
        return next(loginError);
      }
      const token = Util.getToken(user.email);
      Util.setLog('info', `get user jwt token!! -> ${token}`);
      rv = Util.getReturnValue(200, info.message, {
        token,
        userInfo: {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          selected_crypto_symbol: user.selected_crypto_symbol,
          use_exchange: user.use_exchange
        }
      });
      Util.setLog('info', `login api success!! -> ${Util.stringify(rv)}`);
      return res.status(200).json(rv);
    });
  })(req, res, next);
});
/**
 * @description 사용자의 로그아웃. request 헤더에서 사용자 인증정보를 전달받아 사용자 테이블에 매핑된 토큰값을 삭제한다.
 * @author jhmooon
 * @date 2018-12-11
 *
 */
router.get('/logout', Middleware.verifyToken, async (req, res) => {
  Util.setLog('info', `USER LOGOUT!! -> ${Util.stringify(Util.getJWTDecode(req.headers.authorization.split(' ')[1]))}`);
  try {
    let rv = null;
    req.logout();
    rv = Util.getReturnValue(200, 'RESPONSE_CODE_OK');
    Util.setLog('info', `user logout api success!! -> ${Util.stringify(rv)}`);
    return res.status(200).json(rv);
  } catch(err) {
    Util.setLog('error', `user logout api error:: ${err}`);
    rv = Util.getReturnValue(500, 'ERROR_LOGOUT');
    return res.status(200).json(rv);
  }
});
module.exports = router;