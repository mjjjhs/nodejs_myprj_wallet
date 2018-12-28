const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Util = require('../util/Util'); //유틸리티성 함수 모듈
const Db = require('../database/Mysql'); //데이터베이스 관련 함수 모듈
const bcrypt = require('bcrypt');
require('dotenv').config(); //env 모듈

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  passReqToCallback: true //인증을 수행하는 인증 함수로 HTTP request를 그대로  전달할지 여부를 결정한다
}, async (req, email, password, done) => {
  console.log(`LocalStrategy start!! -> ${email}`);
  try {
    // 사용자 계정이 있는지 체크 쿼리
    const userData = await Db.sendQuery(Db.getQeury('findUserByEmail', email));
    if (userData && userData.length) {
      const result = await bcrypt.compare(password, userData[0].passwd);
      console.log('result::',result);
      if (result) {
        done(null, userData[0], { message: 'LOGGED_IN_SUCCEFFULLY' });
      } else {
        done(null, false, { message: 'WRONG_USER_INFO.' });
      }
    } else {
      done(null, false, { message: 'NOT_A_MEMBER.' });
    }
  } catch (err) {
    Util.setLog('error', `passport LocaStrategy error:: ${err}`);
    done(err);
  }
}));