const express = require('express');
const Util = require('../util/Util'); //유틸리티성 함수 모듈
const CommonAPI = require('../util/CommonAPI'); // 공용 API
const Middleware = require('../middleware/Middleware'); //미들웨어 모듈
const Db = require('../database/Mysql'); //데이터베이스 관련 함수 모듈
const nonce = require('nonce')();
const router = express.Router();
require('dotenv').config(); //env 모듈

/**
 * @description 코빈후드 거래소의 oAuth 과정중 사용자가 코빈후드에 로그인 후 scope를 설정한 뒤 확인을 누르면 해당 콜백 URL을 코빈후드 쪽에서 호출. 토큰을 부여받아 등록하고 연동거래소를 등록.
 * @author jhmooon
 * @date 2018-12-27
 * @param {string} code 코빈후드 거래소의 oAuth 후 부여받는 jwt code값
 * @param {string} state 코빈후드 거래소의 oAuth State 값.
 */
router.get('/callback', async (req, res, next) => {
	Util.setLog('info', `cobinhood client callback API call!! -> ${Util.stringify(req.query)}`);
	try{
		const userOAuthState = await CommonAPI.getUserEmailToCobinhoodOAuthState(req.query.state); //코빈후드의 oAuth state 값으로 사용자의 Email을 가져온다.
		if(!userOAuthState.length) {
			Util.setLog('error', `get user email to cobinhood oAuth state failed -> state::${req.query.state}`);
			return res.status(301).redirect(`${ process.env.COBINHOOD_OAUTH_ERROR_REDIRECT_URL }`);
		}
		const token = await CommonAPI.getCobinhoodToken(req.query.code); //코빈후드의 oAuth Token을 가져옴.
		if(!token) {
			Util.setLog('info', `get cobinhood token failed!! -> token::${ (token) }`);
			return res.status(301).redirect(`${ process.env.COBINHOOD_OAUTH_ERROR_REDIRECT_URL }`);
		}
		Util.setLog('info', `get cobinhood token!! -> ${ Util.stringify(token) }`);
		const transactionRv = await Db.setCobinhoodOAuthTokenAndUserUseExchange({ accessToken: token.access_token, refreshToken: token.refresh_token, scope: token.scope, tokenType: token.token_type, email: userOAuthState[0].email });//받아온 oauth 토큰을 사용자데이터에 매핑하고 연동 거래소를 사용자 데이터에 매핑하는 트랜잭션을 실행
		if(!transactionRv) {
			Util.setLog('error', `setCobinhoodOAuthTokenAndUserUseExchange Transaction API error -> db transaction result::${transactionRv}`);
			return res.status(301).redirect(`${ process.env.COBINHOOD_OAUTH_ERROR_REDIRECT_URL }`);
		}
		return res.status(301).redirect(`${ process.env.COBINHOOD_OAUTH_RESOURCE_OWNER_REDIRECT_URL }`);
	} catch(err) {
		Util.setLog('error', `cobinhood client callback API error:: ${err}`);
    return res.status(301).redirect(`${ process.env.COBINHOOD_OAUTH_ERROR_REDIRECT_URL }`);
	}
});
/**
 * @description 코빈후드 거래소의 oAuth 를 진행하기 위해 사용자의 nonce값을 생성
 * @author jhmooon
 * @date 2018-12-27
 * @return {json}
 */
router.get('/oAuthState', Middleware.verifyToken, async (req, res, next) => {
	Util.setLog('info', `get cobinhood oAuth state API call!!`);
	try{
		const userEmail = req.headers.authorization.split(' ')[0];
		const state = nonce();
		Util.setLog('info', `cobinhood oAuth state value Database insert!! -> userEmail::${userEmail}, state::${state}`);
		const insertResult = await Db.sendQuery(Db.getQeury('addOAuth', userEmail, state, state));//생성한 nonce(state) 값을 데이터베이스에 추가한다.
		let rv = null;
		if(!insertResult || !insertResult.affectedRows){
			Util.setLog('info', `cobinhood oAuth state value Database insert failed!!`);
			rv = Util.getReturnValue(400, 'ADD_OAUTH_STATE_FAILED');
			return res.status(200).json(rv);
		}
		rv = Util.getReturnValue(200, 'RESPONSE_CODE_OK', { state: state });
		Util.setLog('info', `get cobinhood oAuth state success!! -> ${Util.stringify(rv)}`);
		return res.status(200).json(rv);
	} catch (err){
		Util.setLog('error', `cobinhood get oAuth state API error:: ${err}`);
    rv = Util.getReturnValue(500, 'ERROR_GET_COBINHOOD_OAUTH_STATE');
    return res.status(200).json(rv);
	}
});
/**
 * @description 사용자의 oAuth 토큰을 새로 부여받고 코빈후드 각 Wallet의 밸런스들을 가져온다.
 * @author jhmooon
 * @date 2018-12-27
 */
router.get('/getBalance', Middleware.verifyToken, async (req, res, next) => {
  Util.setLog('info', `get cobinhood balance api call!!`);
  const balance = await CommonAPI.getUserCobinhoodBalnace(req.headers.authorization.split(' ')[0]);
  let rv = null;
  if(!balance || !balance.success) {
    Util.setLog('error', `get cobinhood balance getBalance API failed!!`);
    rv = Util.getReturnValue(500, 'ERROR_GET_USER_COBINHOOD_BALANCE');
    return res.status(200).json(rv);
  }
  rv = Util.getReturnValue(200, 'RESPONSE_CODE_OK', balance.result);
  Util.setLog('info', `get cobinhood balance success!! -> ${Util.stringify(rv)}`);
  return res.status(200).json(rv);
});
module.exports = router;