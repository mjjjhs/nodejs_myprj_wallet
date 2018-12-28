const { createLogger, format, transports } = require('winston'); //로그를 위한 모듈
require('winston-daily-rotate-file'); //winston 로그를 날짜별로 쌓기 위한 모듈
const fs = require('fs'); //파일시스템 모듈
const path = require('path'); //경로 모듈
const axios = require('axios'); //비동기 통신 모듈
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
const bigDecimal = require('js-big-decimal'); //decimal 계산 모듈
require('dotenv').config(); //env 모듈
const Util = class Util {
  constructor(...args) {
    this.cobinhoodAuth = null;
  }
  /**
   * @description 로그를 env에 설정한 로그 디렉토리에 날짜별로 생성하는 로그생성 오브젝트를 반환한다.
   * @author jhmoon
   * @date 2018-12-27
   * @returns {object}
   */
  logger() {
    const logDir = `${process.env.LOG_DIR}/api`;
    // Create the log directory if it does not exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    const dailyRotateFileTransport = new transports.DailyRotateFile({
      filename: `${logDir}/%DATE%-results.log`,
      datePattern: 'YYYY-MM-DD'
    });
    const loggerInit = createLogger({
      // change level if in dev environment versus production
      level: 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
      transports: [
        new transports.Console({
          level: 'info',
          format: format.combine(
            format.colorize(),
            format.printf(
              info => `${info.timestamp} ${info.level}: ${info.message}`
            )
          )
        }),
        dailyRotateFileTransport
      ]
    });
    return loggerInit;
  }
  /**
   * @description JWT token을 decode해서 반환.
   * @author jhmoon
   * @date 2018-12-27
   * @param {object} jObj JSON Object
   * @returns {string}
   */
  getJWTDecode(token) {
    return jwt_decode(token);
  }
  /**
   * @description 오브젝트를 stringify 함.
   * @author jhmoon
   * @date 2018-12-27
   * @param {object} jObj JSON Object
   * @returns {string}
   */
  stringify(jObj) {
    try {
      return JSON.stringify(jObj);
    } catch (err) {
      this.setLog('error', `util stringify error -> ${err}`);
    }
  }
  /**
   * @description 로그를 남긴다.
   * @author jhmoon
   * @date 2018-12-27
   * @param {string} logType 로그 생성 타입 ex)info, warn, error
   * @param {string} logData 로그 데이터
   */
  setLog(logType, logData) {
    try {
      this.logger()[logType](logData);
    } catch (err) {
      this.logger().error(`util setLog error -> ${err}`);
    }
  }
  /**
   * @description axios를 이용한 비동기 http 통신
   * @author jhmoon
   * @date 2018-12-27
   * @param {string} url api url
   * @param {string} method http method type
   * @param {object} paramObj request body 파라미터 오브젝트.
   * @param {object} headers request header 데이터
   * @returns {object}
   */
  http(url, method, {paramObj, headers, timeout}) {
    try {
      const http = axios.create();
      if(timeout) http.defaults.timeout = parseInt(timeout, 10);
      switch(method.toLowerCase()) {
        case 'get':
          return (!headers ? http[method.toLowerCase()](url) : http[method.toLowerCase()](url, { headers }));
          break;
        case 'put':
        case 'post':
        case 'delete':
          return (!headers ? http[method.toLowerCase()](url,  paramObj) : http[method.toLowerCase()](url, paramObj, { headers }));
          break;
      }
    } catch (err) {
      this.setLog('error', `util http error -> ${err}`);
    }
  }
  /**
   * @description 코인 마켓 캡에 명시되어 있는 암호화폐별 인덱스를 리턴.
   * @author jhmoon
   * @date 2018-12-27
   * @param {string} cryptoName 암호화폐 이름
   * @returns {integer}
   */
  getCryptoIdx(cryptoName) {
    const mappingData = {
      'FXT': 2723,
      'ETH': 1027,
      'BCH': 1831,
      'DASH': 131
    };
    return mappingData[cryptoName];
  }
  /**
   * @description 사용자 인증 토큰 발급
   * @author jhmoon
   * @date 2018-12-27
   * @param {string} email 사용자의 아이디 (이메일)
   * @returns {string}
   */
  getToken(email) {
    const token = jwt.sign({
      id: email
    },
    process.env.SECRET,
    {
      expiresIn: '10y',//로그인시 해당 토큰을 무제한 사용할 수 있다. (로그인시마다 새로운 토큰 부여)
      issuer: 'jhmoon'
    });
    return token;
  }
  /**
   * @description 파라미터를 return value 오브젝트로 만들어 리턴한다.
   * @author jhmoon
   * @date 2018-12-27
   * @param {integer} statusCode response result code
   * @param {string} msg response 메시지
   * @param {object} returnData response 데이터
   * @returns {object}
   */
  getReturnValue(statusCode, msg, returnData) {
    let rv = null;
    if(returnData) {
      rv = { result: statusCode, message: msg, data: returnData };
      this.setLog('info', `${msg} -> Response Data:: ${this.stringify(rv)}`);
      return rv;
    }
    rv = { result: statusCode, message: msg };
    this.setLog('info', `${msg} ->Response Data:: ${this.stringify(rv)}`);
    return rv;
  }
  /**
   * @description 코빈후드거래소의 myprj 응용프로그램에 부여한 클라이언트 ID를 반환
   * @author jhmoon
   * @date 2018-12-27
   * @returns {string}
   */
  getCobinhoodClientAPIKey() {
    return { 'Authorization': `${ process.env.COBINHOOD_API_KEY }`};
  }
  /**
   * @description 코빈후드거래소의 oAuth를 진행하기위한 authentication 헤더를 만들어 반환 (client id : client secret을 base64로 암호화)
   * @author jhmoon
   * @date 2018-12-27
   * @returns {string}
   */
  getHTTPBasicAuthentication() {
    const authentication = new Buffer.from(`${ process.env.COBINHOOD_CLIENT_ID }:${ process.env.COBINHOOD_CLIENT_SECRET }`).toString('base64');
    return { 'Authorization': `Basic ${ authentication }`, 'Content-Type': 'application/x-www-form-urlencoded' };
  }
  /**
   * @description 코빈후드 oAuth 진행 후에 얻은 토큰데이터로 헤더정보를 생성하여 반환
   * @author jhmoon
   * @date 2018-12-27
   * @param {string} accessToken 사용자의 코빈후드 Access Token
   * @param {string} tokenType Ahthorization 헤더를 만들기 위한 문자
   * @returns
   */
  getAccessTokenAuthentication(accessToken, tokenType, isNonce) {
    if(!isNonce) {
      return { 'Authorization': `${ tokenType } ${ accessToken }`, 'Content-Type': 'application/json' };
    }
    return { 'Authorization': `${ tokenType } ${ accessToken }`, 'Content-Type': 'application/json', 'nonce': new Date().getTime() };
  }
  /**
   * @description decimal이 큰 수의 나눗셈을 한 결과를 리턴
   * @author jhmoon
   * @date 2018-12-27
   * @param {float} tranAmt 발생한 트랜잭션의 결제 가격
   * @param {float} tranCurrPrice 사용자가 선택한 암호화폐의 시세 가격 (1비트코인/1이더/1FXT/1DASH)
   * @returns {string}
   */
  getBigDecimalDivideValue(tranAmt, tranCurrPrice) {
    let quotient = bigDecimal.divide(tranAmt.toString(), tranCurrPrice.toString(), 12);
    quotient = new bigDecimal(quotient);
    quotient = quotient.round(process.env.CRYPTOCURRENCY_EXCHANGE_DECIMAL, bigDecimal.RoundingModes.DOWN);
    return quotient;
  }
};
module.exports = new Util();