const Util = require('./Util'); //유틸리티성 함수 모듈
const Db = require('../database/Mysql'); //데이터베이스 관련 함수 모듈
const queryString = require('querystring');
require('dotenv').config(); //env 모듈
const CommonAPI = class CommonAPI {
  constructor(...args) {}
  /**
   * @description 사용자의 코빈후드 거래소의 oAuth Token (access/refresh)을 받아온다.
   * @author jhmooon
   * @date 2018-12-28
   * @param {string} code 유저의 cobinhood 거래소의 jwt 토큰
   * @return {json}
   *
   */
  async getCobinhoodToken(code) {
    try {
      const headers = Util.getHTTPBasicAuthentication(); //헤더에 사용할 HTTP 표준 Basic 토큰을 가져온다.
      const paramObj = queryString.stringify({
        grant_type: 'authorization_code',
        code: code, //코빈후드 측에서 넘어온 토큰 값
        redirect_uri: process.env.COBINHOOD_OAUTH_CLIENT_REDIRECT_URL,
        client_id: process.env.COBINHOOD_CLIENT_ID
      });
      console.log('getCobinhoodToken::',paramObj);
      Util.setLog('info', `cobinhood get token API call!! -> param::${ paramObj } headers::${ Util.stringify(headers) }`);
      const token = await Util.http(`${ process.env.COBINHOOD_OAUTH_API_URL }/v1/oauth2/token`, 'POST', { paramObj, headers }); //토큰을 받기위한 파라미터와 헤더값을 이용하여 코빈후드 oAuth 토큰을 가져옴.
      if(!token || token.status !== 200) {
        Util.setLog('error', `get cobinhood user token failed:: ${ token.statusText }`);
        return false;
      }
      return token.data;
    } catch(err) {
      Util.setLog('error', `cobinhood get token API error:: ${err}`);
      return false;
    }
  }
  /**
   * @description 코빈후드 거래소의 oAuth State 값(nonce)으로 사용자의 이메일을 가져온다.
   * @author jhmooon
   * @date 2018-12-28
   * @param {string} state 코빈후드 거래소의 oAuth State 값 (nonce)
   * @return {object}
   *
   */
  async getUserEmailToCobinhoodOAuthState(state) {
    Util.setLog('info', `getUserEmailToCobinhoodOAuthState API call!!`);
    const result = await Db.sendQuery(Db.getQeury('getEmailToCobinhoodOAuthState', state));
    return result;
  }
  /**
   * @description 사용자의 코빈후드 oAuth refresh 토큰을 가져온다
   * @author jhmoon
   * @date 2018-12-27
   * @param {string} email 사용자의 이메일
   * @returns {json}
   */
  async getUserCobinhoodRefreshToken(email) {
    Util.setLog('info', `getUserCobinhoodRefreshToken API call!! -> ${ email }`);
    try {
      const result = await Db.sendQuery(Db.getQeury('getUserCobinhoodRefreshToken', email));
      if(!result || !result.length){
        Util.setLog('error', `getUserCobinhoodRefreshToken failed!!`);
        return false;
      }
      return result[0].refresh_token;
    } catch(err) {
      Util.setLog('error', `getUserCobinhoodRefreshToken API error!! ->  ${ err }`);
      return false;
    }
  }
  /**
   * @description 코빈후드의 oAuth 토큰을 가져오고 사용자 테이블에 매핑한다.
   * @author jhmoon
   * @date 2018-12-27
   * @param {string} email 사용자의 이메일
   * @returns {json}
   */
  async updateCobinhoodOAuthToken(email) {
    Util.setLog('info', `updateCobinhoodOAuthToken API call!!`);
    try{
      const refreshToken = await this.getUserCobinhoodRefreshToken(email); // 사용자 테이블에 매핑되어 있는 refresh token을 가져온다.
      if(!refreshToken) {
        Util.setLog('error', `get user cobinhood refresh token failed -> email::${ email }`);
        return false;
      }
      const headers = Util.getHTTPBasicAuthentication(); //헤더에 사용할 HTTP 표준 Basic 토큰을 가져온다.
      const paramObj = queryString.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      });
      const token = await Util.http(`${ process.env.COBINHOOD_OAUTH_API_URL }/v1/oauth2/token`, 'POST', { paramObj, headers });
      console.log('token::',token.data);
      if(!token || !token.data) {
        Util.setLog('error', `get cobinhood token failed`);
        return false;
      }
      let updateResult = await Db.sendQuery(Db.getQeury('setUserCobinhoodOAuthToken', token.data.access_token, token.data.refresh_token, token.data.scope, token.data.token_type, email), true); //사용자의 테이블에 해당 oAuth 토큰 데이터 매핑.
      if(!updateResult || !updateResult.changedRows) {
        Util.setLog('error', `update user cobinhood oauth token failed -> email::${ email }, token::${Util.stringify(token)}`);
        return false;
      }
      return token.data;
    } catch(err) {
      Util.setLog('error', `updateCobinhoodOAuthToken API error::${err}`);
			return false;
    }
  }
  /**
   * @description 사용자의 코빈후드 oAuth 토큰을 새로 받아 등록하고 밸런스를 가져온다.
   * @author jhmoon
   * @date 2018-12-27
   * @param {string} email 사용자의 이메일
   * @returns {json}
   */
  async getUserCobinhoodBalnace(email) {
    Util.setLog('info', `getUserCobinhoodBalnace api call!!`);
    try {
      const token = await this.updateCobinhoodOAuthToken(email);
      if(!token) {
        Util.setLog('error', `update cobinhood token to get balance failed`);
        return false;
      }
      const headers = Util.getAccessTokenAuthentication(token.access_token, token.token_type); //헤더에 사용할 HTTP 표준 Bearer 토큰을 가져온다.
      const balance = await Util.http(`${process.env.COBINHOOD_OAUTH_API_URL}/v1/wallet/balances`, 'GET', { headers });
      if(!balance || !balance.data.success) {
        Util.setLog('error', `get user cobinhood balance getUserCobinhoodBalnace API failed`);
        return false;
      }
      return balance.data;
    } catch (err) {
      Util.setLog('error', `getUserCobinhoodBalnace API error:: ${err}`);
      return false;
    }
  }
};
module.exports = new CommonAPI();