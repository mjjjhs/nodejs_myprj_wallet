const express = require('express');
const Util = require('../../util/Util'); //유틸리티성 함수 모듈
const Db = require('../../database/Mysql'); //데이터베이스 관련 함수 모듈
const Middleware = require('../../middleware/Middleware'); //미들웨어 모듈
const router = express.Router();
require('dotenv').config(); //env 모듈

/**
 * @description 사용자의 정보를 가져온다. (패스워드 정보는 생략)
 * @author jhmooon
 * @date 2018-12-27
 */
router.get('/getUserInfo', Middleware.verifyToken, async (req, res, next) => {
  Util.setLog('info', `get user info api call!!`);
  try {
    const result = await Db.sendQuery(Db.getQeury('findUserWithPasswordLessByEmail', Util.getJWTDecode(req.headers.authorization.split(' ')[1]).id));
    let rv = null;
    if(!result || !result.length) {
      Util.setLog('error', `get user info failed!!`);
      rv = Util.getReturnValue(500, 'ERROR_GET_USER_INFO_FAILED');
      return res.status(200).json(rv);
    }
    rv = Util.getReturnValue(200, 'RESPONSE_CODE_OK', result);
    Util.setLog('info', `get user info success!! -> ${Util.stringify(rv)}`);
    return res.status(200).json(rv);
  } catch(err) {
    Util.setLog('error', `get user info API error:: ${err}`);
    rv = Util.getReturnValue(500, 'ERROR_GET_USER_INFO');
    return res.status(200).json(rv);
  }
});
module.exports = router;