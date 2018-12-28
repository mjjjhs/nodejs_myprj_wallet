<template>
  <div v-cloak>
    <h2 class="ui header">Project::Wallet Service<button class="logout_btn" @click="clickLogout">Logout</button></h2>
    <div class="ui message">
      <div class="header">수락해 주셔서 감사합니다.<br> Project::Wallet 서비스에서는, </div>
      <p>잔고 조회</p>
      <div class="header">를 하겠습니다.</div>
      <div class="header">(언제든지 위의 수락내용을 취소할 수 있습니다.)</div>
    </div>

    <div class="ui divider"></div>

    <button class="fluid ui blue basic button check" @click='checkBalance' @mousedown="upDownButton" @mouseup="upDownButton">잔고조회</button>
    <!-- <button class="fluid ui red basic button" @click='transfer'>암호화폐 전송(Transfer)</button> -->

    <div class='ui divider'></div>

    <div class="ui segment" v-if="balances">
      <table style="width:100%;">
        <tr>
          <th>NAME</th>
          <th>BALANCE</th>
          <th>USD</th>
        </tr>
        <tr v-for="(balance, idx) in balances" :key="idx">
          <td>{{balance.currency}}</td>
          <td>{{balance.total}}</td>
          <td>{{balance.usd_value}}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyWallet',
  data() {
    return {
      balances: null
    };
  },
  methods: {
    upDownButton(e) {
      let className = e.target.className;
      if(e.type === 'mousedown') {
        className = className.replace('blue', 'red');
      }else {
        className = className.replace('red', 'blue');
      }
      e.target.className = className;
    },
    async checkBalance() {
      const balance = await this.$http.get(
        `${process.env.VUE_APP_API_HOST_URL}/auth/cobinhood/getBalance`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${this.$store.state.userInfo.email} ${this.$store.state.token}`
          }
        }
      );
      if(balance && balance.data.result === 200){
        let isInitValue = { //초기 Project::Wallet에서 지원하는 토큰의 값
          'BCH' : false,
          'ETH' : false,
          'FXT' : false,
          'DASH' : false
        };
        const cryptoArr = balance.data.data.balances.filter((obj) => {
          if(obj.currency === 'BCH' || obj.currency === 'ETH' || obj.currency === 'FXT' || obj.currency === 'DASH') {
            isInitValue[obj.currency] = true; //사용자가 cobinhood에 가지고 있는 Project::Wallet 지원 cryptcurrency 를 체크.
            return obj;
          }
        });
        for(let prop in isInitValue) { //사용자가 cobinhood에 가지고 있지 않은 Project::Wallet 지원 암호화폐는 리스트 목록에 포함되지 않아 초기화 하여 값을 넣어준다.
          if(!isInitValue[prop]) {
            cryptoArr.push({
              currency: prop,
              total: 0,
              usd_value: 0
            });
          }
        }
        this.balances = cryptoArr;
      }
    },
    async clickLogout() {
      if(!this.$store.state.userInfo) {
        alert(`로그인 중이 아닙니다.`);
        return false;
      }
      const logoutData = await this.$http.get(
        `${process.env.VUE_APP_API_HOST_URL}/api/${process.env.VUE_APP_API_VER}/auth/logout`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${this.$store.state.userInfo.email} ${this.$store.state.token}`
          }
        }
      );
      if(logoutData.data.result === 401 || logoutData.data.result === 200) {
        this.$store.commit('clearUserData');
        this.$store.commit('clearTokenData');
        this.$router.push('/');
        return false;
      }
    },
    async fetchUserData() {
      const userInfo = await this.$http.get(
        `${process.env.VUE_APP_API_HOST_URL}/api/v1/user/getUserInfo`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${this.$store.state.userInfo.email} ${this.$store.state.token}`
          }
        }
      );
      if(userInfo.data.result === 500){
        alert(`get user info failed`);
        return false;
      }
      this.$store.commit('setUserData', userInfo.data.data[0]);
    }
  },
  watch: {
    '$route': 'fetchUserData'
  },
  async created() {
    if(this.$store.state.userInfo === null) {
      this.$router.push('/');
    }
    await this.fetchUserData();
    if(this.$store.state.userInfo.use_exchange === null) {
      this.$router.push('/checkin');
    }
  }
};
</script>

<style>
  * {
    outline: 0 none;
    box-sizing: border-box;
  }
  html {
    line-height: 1.15;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    font-size: 14px;
  }
  *, :after, :before {
    -webkit-box-sizing: inherit;
    box-sizing: inherit;
  }
  button {
    font-size:14px;
    margin-top:40px;
    border-radius:5px;
    outline: 0 none;
    cursor:pointer;
  }
  button.logout_btn {
    position: absolute;
    right: 0;
    font-size:12px;
    line-height:20px;
    margin-right:20px;
    vertical-align: middle;
    margin-top:5px;
  }
  body ::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 10px;
    height: 10px;
  }
  body ::-webkit-scrollbar-thumb {
    cursor: pointer;
    border-radius: 5px;
    background: rgba(0,0,0,.25);
    -webkit-transition: color .2s ease;
    transition: color .2s ease;
  }
  body ::-webkit-scrollbar-track {
    background: rgba(0,0,0,.1);
    border-radius: 0;
  }
  ::selection {
    background-color: #cce2ff;
    color: rgba(0,0,0,.87);
  }
  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    min-width: 320px;
    background: #fff;
    font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
    font-size: 14px;
    line-height: 1.4285em;
    color: rgba(0,0,0,.87);
  }
  h2 {
    font-size: 1.71428571rem;
  }
  h1, h2, h3, h4, h5 {
    font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
    line-height: 1.28571429em;
    margin: calc(2rem - .14285714em) 0 1rem;
    font-weight: 700;
    padding: 0;
  }
  h2.ui.header {
    font-size: 1.71428571rem;
  }
  h1:first-child, h2:first-child, h3:first-child, h4:first-child, h5:first-child {
    margin-top: 0;
  }
  .ui.header {
    border: none;
    margin: calc(2rem - .14285714em) 0 1rem;
    padding: 0 0;
    font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
    font-weight: 700;
    line-height: 1.28571429em;
    text-transform: none;
    color: rgba(0,0,0,.87);
  }
  .ui.header:first-child {
    margin-top: -.14285714em;
  }
  .ui.message {
    position: relative;
    min-height: 1em;
    margin: 1em 0;
    background: #f8f8f9;
    padding: 1em 1.5em;
    line-height: 1.4285em;
    color: rgba(0,0,0,.87);
    -webkit-transition: opacity .1s ease,color .1s ease,background .1s ease,-webkit-box-shadow .1s ease;
    transition: opacity .1s ease,color .1s ease,background .1s ease,-webkit-box-shadow .1s ease;
    transition: opacity .1s ease,color .1s ease,background .1s ease,box-shadow .1s ease;
    transition: opacity .1s ease,color .1s ease,background .1s ease,box-shadow .1s ease,-webkit-box-shadow .1s ease;
    border-radius: .28571429rem;
    -webkit-box-shadow: 0 0 0 1px rgba(34,36,38,.22) inset, 0 0 0 0 transparent;
    box-shadow: 0 0 0 1px rgba(34,36,38,.22) inset, 0 0 0 0 transparent;
  }
  .ui.message {
    font-size: 1em;
  }
  .ui.message .header {
    display: block;
    font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
    font-weight: 700;
    margin: -.14285714em 0 0 0;
  }
  .ui.message>:first-child {
    margin-top: 0;
  }
  .ui.message .header:not(.ui) {
    font-size: 1.14285714em;
  }
  .ui.message .list:not(.ui) {
    text-align: left;
    padding: 0;
    opacity: .85;
    list-style-position: inside;
    margin: .5em 0 0;
  }
  .ui.message .list:not(.ui) li {
    position: relative;
    list-style-type: none;
    margin: 0 0 .3em 1em;
    padding: 0;
  }
  .ui.message .list:not(.ui) li:last-child {
    margin-bottom: 0;
  }
  .ui.message .list:not(.ui) li::before {
    position: absolute;
    content: "•";
    left: -1em;
    height: 100%;
    vertical-align: baseline;
  }
  .ui.divider {
    margin: 1rem 0;
    line-height: 1;
    height: 0;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: rgba(0,0,0,.85);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .ui.divider {
    font-size: 1rem;
  }

  .ui.divider:not(.vertical):not(.horizontal) {
    border-top: 1px solid rgba(34,36,38,.15);
    border-bottom: 1px solid rgba(255,255,255,.1);
  }
  button {
    -webkit-appearance: button;
  }
  input, textarea, select, button, meter, progress {
    -webkit-writing-mode: horizontal-tb !important;
  }
  input, textarea, select, button {
    text-rendering: auto;
    color: initial;
    letter-spacing: normal;
    word-spacing: normal;
    text-transform: none;
    text-indent: 0px;
    text-shadow: none;
    display: inline-block;
    text-align: start;
    margin: 0em;
    font: 400 11px system-ui;
  }
  input[type="button" i], input[type="submit" i], input[type="reset" i], input[type="file" i]::-webkit-file-upload-button, button {
    align-items: flex-start;
    text-align: center;
    cursor: pointer;
    color: buttontext;
    background-color: buttonface;
    box-sizing: border-box;
    padding: 2px 6px 3px;
    border-width: 2px;
    border-style: outset;
    border-color: buttonface;
    border-image: initial;
  }
  input[type="button" i], input[type="submit" i], input[type="reset" i], input[type="file" i]::-webkit-file-upload-button, button {
    border-color: rgb(216, 216, 216) rgb(209, 209, 209) rgb(186, 186, 186);
    border-style: solid;
    border-width: 1px;
    padding: 1px 7px 2px;
  }
  button, input, optgroup, select, textarea {
    font-family: sans-serif;
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
  }
  button, input {
    overflow: visible;
  }
  button, select {
    text-transform: none;
  }

  [type=reset], [type=submit], button, html [type=button] {
    -webkit-appearance: button;
  }
  .check {
    margin-bottom: 4px !important;
  }
  .ui.button {
    cursor: pointer;
    display: inline-block;
    min-height: 1em;
    outline: 0;
    border: none;
    vertical-align: baseline;
    background: #e0e1e2 none;
    color: rgba(0,0,0,.6);
    font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
    margin: 0 .25em 0 0;
    padding: .78571429em 1.5em .78571429em;
    text-transform: none;
    text-shadow: none;
    font-weight: 700;
    line-height: 1em;
    font-style: normal;
    text-align: center;
    text-decoration: none;
    border-radius: .28571429rem;
    -webkit-box-shadow: 0 0 0 1px transparent inset, 0 0 0 0 rgba(34,36,38,.15) inset;
    box-shadow: 0 0 0 1px transparent inset, 0 0 0 0 rgba(34,36,38,.15) inset;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-transition: opacity .1s ease,background-color .1s ease,color .1s ease,background .1s ease,-webkit-box-shadow .1s ease;
    transition: opacity .1s ease,background-color .1s ease,color .1s ease,background .1s ease,-webkit-box-shadow .1s ease;
    transition: opacity .1s ease,background-color .1s ease,color .1s ease,box-shadow .1s ease,background .1s ease;
    transition: opacity .1s ease,background-color .1s ease,color .1s ease,box-shadow .1s ease,background .1s ease,-webkit-box-shadow .1s ease;
    will-change: '';
    -webkit-tap-highlight-color: transparent;
  }
  .ui.button, .ui.buttons .button, .ui.buttons .or {
    font-size: 1rem;
  }
  .ui.basic.button, .ui.basic.buttons .button {
    background: transparent none!important;
    color: rgba(0,0,0,.6)!important;
    font-weight: 400;
    border-radius: .28571429rem;
    text-transform: none;
    text-shadow: none!important;
    -webkit-box-shadow: 0 0 0 1px rgba(34,36,38,.15) inset;
    box-shadow: 0 0 0 1px rgba(34,36,38,.15) inset;
  }
  .ui.fluid.button, .ui.fluid.buttons {
    width: 100%;
  }
  .ui.fluid.button {
    display: block;
  }
  .ui.blue.button, .ui.blue.buttons .button {
    background-color: #2185d0;
    color: #fff;
    text-shadow: none;
    background-image: none;
  }
  .ui.blue.button {
    -webkit-box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;
    box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;
  }
  .ui.basic.blue.button, .ui.basic.blue.buttons .button {
    -webkit-box-shadow: 0 0 0 1px #2185d0 inset!important;
    box-shadow: 0 0 0 1px #2185d0 inset!important;
    color: #2185d0!important;
  }
  .ui.red.button, .ui.red.buttons .button {
    background-color: #db2828;
    color: #fff;
    text-shadow: none;
    background-image: none;
  }
  .ui.red.button {
    -webkit-box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;
    box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;
  }
  .ui.basic.red.button, .ui.basic.red.buttons .button {
    -webkit-box-shadow: 0 0 0 1px #db2828 inset!important;
    box-shadow: 0 0 0 1px #db2828 inset!important;
    color: #db2828!important;
  }
  .ui.segment {
    position: relative;
    background: #fff;
    -webkit-box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
    box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
    margin: 1rem 0;
    padding: 1em 1em;
    border-radius: .28571429rem;
    border: 1px solid rgba(34,36,38,.15);
  }
  .ui.segment, .ui.segments .segment {
    font-size: 1rem;
  }
  .ui.segment:last-child {
    margin-bottom: 0;
  }
  table > tr > th {
    font-size:14px;
    font-weight: bold;
    width:33.3%;
  }

</style>
