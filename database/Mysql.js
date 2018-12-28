const mysql = require('mysql2/promise'); //mysql 모듈
const Util = require('../util/Util'); //유틸리티성 함수 모듈
require('dotenv').config(); //env 모듈
const Database = class Database {
  constructor(...args) {}
  /**
   * @description SQL 쿼리를 설정하여 반환
   * @author jhmoon
   * @date 2018-12-26
   * @param {string} type 쿼리 기능 타입
   * @param {array} args 쿼리에 삽입할 데이터 배열
   * @returns {object}
   */
  getQeury(type, ...args) {
    let rv = null;
    switch (type) {
      case 'findUserByEmail': //Email로 사용자 정보를 가져옴
        rv = {
          queryType: 'select',
          query: 'SELECT * FROM USER WHERE email = ?',
          params: args
        };
        break;
      case 'addUser': //사용자 추가
        rv = {
          queryType: 'insert',
          query: `INSERT INTO USER (email, passwd, first_name, last_name) VALUES (?, ?, ?, ?)`,
          params: args
        };
        break;
      case 'addOAuth': //cobinhood oAuth State 값을 사용자와 매핑
        rv = {
          queryType: 'insert',
          query: 'INSERT INTO COBINHOOD_OAUTH (email, state) VALUES (?, ?) ON DUPLICATE KEY UPDATE state = ?',
          params: args
        };
        break;
      case 'findUserWithPasswordLessByEmail': //Email로 사용자 정보를 가져옴(패스워드 정보없음)
      rv = {
        queryType: 'select',
        query: 'SELECT email, first_name, last_name, selected_crypto_symbol, use_exchange FROM USER WHERE email = ?',
        params: args
      };
      break;
      case 'getEmailToCobinhoodOAuthState': //cobinhood oAuth State 값으로 사용자의 이메일을 가져옴
        rv = {
          queryType: 'select',
          query: 'SELECT email FROM COBINHOOD_OAUTH WHERE state = ?',
          params: args
        };
        break;
      case 'setUserCobinhoodOAuthToken': //사용자에 cobinhood oAuth용 토큰을 매핑
        rv = {
          queryType: 'update',
          query: 'UPDATE COBINHOOD_OAUTH SET access_token = ?, refresh_token = ?, scope = ?, token_type = ? WHERE email = ?',
          params: args
        };
        break;
      case 'setUserUseExchange': //사용자 정보에 연동 거래소가 있다는 Flag(거래소이름)를 설정
        rv = {
          queryType: 'update',
          query: 'UPDATE USER SET use_exchange = ? WHERE email = ?',
          params: args
        };
        break;
      case 'getUserCobinhoodRefreshToken': //사용자의 cobinhood oAuth refresh token을 가져온다
        rv = {
          queryType: 'select',
          query: 'SELECT refresh_token FROM COBINHOOD_OAUTH WHERE email = ?',
          params: args
        };
        break;
    }
    return rv;
  }
  /**
   * @description 코빈후드 oAuth 진행 후 callback 페이지로 오면서 받아온 유저의 토큰을 데이터베이스의 사용자데이터에 매핑하고 연동된 거래소(코빈후드)를 사용자데이터에 등록.
   * @author jhmoon
   * @date 2018-12-20
   * @param {object} obj 코빈후드에서 받은 oAuth 토큰(accessToken, refreshToken, scope, tokenType, email)
   * @returns {boolean}
   */
  async setCobinhoodOAuthTokenAndUserUseExchange(obj) {
    Util.setLog('info', `setCobinhoodOAuthTokenAndUserUseExchange API call!! --> ${ Util.stringify(obj) }`);
    try {
      const conn = await this.dbConnection();
      try{
        await conn.beginTransaction(); //Start transaction
        let [rows] = await conn.query('UPDATE COBINHOOD_OAUTH SET access_token = ?, refresh_token = ?, scope = ?, token_type = ? WHERE email = ?', [obj.accessToken, obj.refreshToken, obj.scope, obj.tokenType, obj.email]);
        if(!rows.affectedRows && !rows.changedRows){
          await conn.rollback(); //ROLLBACK
          conn.release();
          Util.setLog('error', `setCobinhoodOAuthTokenAndUserUseExchange Insert or Update Error. rollback!!`);
          return false;
        }
        [rows] = await conn.query('UPDATE USER SET use_exchange = ? WHERE email = ?', [1, obj.email]);
        if(!rows.affectedRows && !rows.changedRows){
          await conn.rollback(); //ROLLBACK
          conn.release();
          Util.setLog('error', `setCobinhoodOAuthTokenAndUserUseExchange Insert or Update Error. rollback!!`);
          return false;
        }
        await conn.commit(); //START TRANSACTION
        conn.release();
        return true;
      } catch(err) {
        await conn.rollback(); //ROLLBACK
        conn.release();
        Util.setLog('error', `Query Error. -> ${err}`);
        return false;
      }
    } catch(err) {
      Util.setLog('error', `DB Error. -> ${err}`);
      return false;
    }
  }
  /**
   * @description 데이터베이스에 연결한다.
   * @author jhmoon
   * @date 2018-12-27
   * @returns {object}
   */
  async dbConnection() {
    const env = process.env;
    const pool = mysql.createPool({
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PW,
      database: env.DB_NAME
    });
    const connection = await pool.getConnection(async conn => conn);
    return connection;
  }
  /**
   * @description 데이터베이스에 query를 send
   * @author jhmoon
   * @date 2018-12-27
   * @param {string} queryType 쿼리의 타입 ex) select, insert, delete, update...
   * @param {string} query 데이터베이스 쿼리
   * @param {array} params 쿼리에 삽입할 변수 데이터 배열
   * @returns {object}
   */
  async sendQuery({queryType, query, params}) {
    console.log('queryType::',queryType, 'query::',query, 'params::',params);
    try {
      const conn = await this.dbConnection();
      try{
        if(queryType !== 'select') await conn.beginTransaction();
        const [rows] = await conn.query(query, params);
        if(queryType !== 'select') await conn.commit(); //START TRANSACTION
        conn.release();
        return rows;
      } catch(err) {
        if(queryType !== 'select') await conn.rollback(); //ROLLBACK
        conn.release();
        Util.setLog('error', `Query Error. -> ${err}`);
        return false;
      }
    } catch(err) {
      Util.setLog('error', `DB Error. -> ${err}`);
      return false;
    }
  }
};
module.exports = new Database();
