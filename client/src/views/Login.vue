<template>
  <div class="login">
    <h1>Crypto Currency Wallet</h1>
    <!-- <img alt="Project::Wallet logo" src="../assets/fuzex_logo.png"> -->
    <div class="login_box">
      <label for="user_id">ID</label>
      <input type="text" placeholder="ID" value="" id="user_id" autocomplete="username"><br>
      <label for="user_pw">PASSWORD</label>
      <input type="password" placeholder="PASSWORD" value="" id="user_pw">
    </div>
    <button @click="clickLogin">Log in</button>
    <button @click="clickCreate">Sign up</button>

  </div>
</template>

<script>
  // @ is an alias to /src
  // import Scenario from '@/components/Scenario.vue';
  export default {
    name: 'login',
    methods: {
      async clickLogin() {
        const email = document.getElementById('user_id').value.trim();
        const password = document.getElementById('user_pw').value.trim();
        if(!email.length || !password.length) {
          alert('빈칸');
          return false;
        }
        const loginData = await this.$store.dispatch('setUserData', {email, password});
        console.log('loginData::',loginData);
        if(loginData && loginData.data.result === 200) {
          if(loginData.data.data.userInfo.use_exchange === null) {
            this.$router.push('/checkin');
          }else {
            this.$router.push('/mywallet');
          }
        }
      },
      async clickCreate() {
        this.$router.push('/signup');
      }
    },
    created() {
      console.log(this.$store.state.userInfo);
      if(this.$store.state.userInfo !== null) { //로그인 중이면 실행.
        if(!this.$store.state.userInfo.use_exchange === null) {
          this.$router.push('/checkin');
        }else {
          this.$router.push('/mywallet');
        }
      }
    }
  };
</script>

<style scoped>
* {
  outline: 0 none;
  box-sizing: border-box;
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
label {
  font-size:14px;
  margin-right:20px;
}
label[for="user_id"] {
  margin-right:82px;
}

button {
  font-size:14px;
  margin-top:40px;
  border-radius:5px;
  outline: 0 none;
  cursor:pointer;
}
.login_box {
  margin-top:50px;
}
/* [v-cloak] {display: none} */
.ui.fluid.card {
  width: 100%;
  max-width: 9999px;
}
.ui.card {
  margin: 1em 0;
}
.ui.card, .ui.cards>.card {
  max-width: 100%;
  position: relative;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  width: 290px;
  min-height: 0;
  background: #fff;
  padding: 0;
  border: none;
  border-radius: .28571429rem;
  -webkit-box-shadow: 0 1px 3px 0 #d4d4d5, 0 0 0 1px #d4d4d5;
  box-shadow: 0 1px 3px 0 #d4d4d5, 0 0 0 1px #d4d4d5;
  -webkit-transition: -webkit-box-shadow .1s ease,-webkit-transform .1s ease;
  transition: -webkit-box-shadow .1s ease,-webkit-transform .1s ease;
  transition: box-shadow .1s ease,transform .1s ease;
  transition: box-shadow .1s ease,transform .1s ease,-webkit-box-shadow .1s ease,-webkit-transform .1s ease;
  z-index: '';
}
.ui.card:last-child {
  margin-bottom: 0;
}
.ui.card:after, .ui.cards:after {
  display: block;
  content: ' ';
  height: 0;
  clear: both;
  overflow: hidden;
  visibility: hidden;
}
.ui.card>.image, .ui.cards>.card>.image {
  position: relative;
  display: block;
  -webkit-box-flex: 0;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  padding: 0;
  background: rgba(0,0,0,.05);
}
.ui.card>.image:not(.ui)>img, .ui.cards>.card>.image:not(.ui)>img {
    border: none;
}
.ui.card>.image>img, .ui.cards>.card>.image>img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: inherit;
}
.ui.card>:first-child, .ui.cards>.card>:first-child {
  border-radius: .28571429rem .28571429rem 0 0!important;
  border-top: none!important;
}
.ui.card>.content, .ui.cards>.card>.content {
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
  flex-grow: 1;
  border: none;
  border-top: 1px solid rgba(34,36,38,.1);
  background: 0 0;
  margin: 0;
  padding: 1em 1em;
  -webkit-box-shadow: none;
  box-shadow: none;
  font-size: 1em;
  border-radius: 0;
}
.ui.card>.content>.header:not(.ui), .ui.cards>.card>.content>.header:not(.ui) {
  font-weight: 700;
  font-size: 1.28571429em;
  margin-top: -.21425em;
  line-height: 1.28571429em;
}
.ui.card>.content>.header, .ui.cards>.card>.content>.header {
  display: block;
  margin: '';
  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
  color: rgba(0,0,0,.85);
}
.ui.card>.content p, .ui.cards>.card>.content p {
  margin: 0 0 .5em;
}
p:first-child {
  margin-top: 0;
}
p {
  margin: 0 0 1em;
  line-height: 1.4285em;
}
.ui.cards>.card>.content:after {
  display: block;
  content: ' ';
  height: 0;
  clear: both;
  overflow: hidden;
  visibility: hidden;
}
.ui.card>.extra, .ui.cards>.card>.extra {
  max-width: 100%;
  min-height: 0!important;
  -webkit-box-flex: 0;
  -ms-flex-positive: 0;
  flex-grow: 0;
  border-top: 1px solid rgba(0,0,0,.05)!important;
  position: static;
  background: 0 0;
  width: auto;
  margin: 0 0;
  padding: .75em 1em;
  top: 0;
  left: 0;
  color: rgba(0,0,0,.4);
  -webkit-box-shadow: none;
  box-shadow: none;
  -webkit-transition: color .1s ease;
  transition: color .1s ease;
}
.ui.card>:last-child, .ui.cards>.card>:last-child {
  border-radius: 0 0 .28571429rem .28571429rem!important;
}
.ui.basic.green.button, .ui.basic.green.buttons .button {
  -webkit-box-shadow: 0 0 0 1px #21ba45 inset!important;
  box-shadow: 0 0 0 1px #21ba45 inset!important;
  color: #21ba45!important;
}
.ui.green.button {
  -webkit-box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;
  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;
}
.ui.green.button, .ui.green.buttons .button {
  background-color: #21ba45;
  color: #fff;
  text-shadow: none;
  background-image: none;
}
.ui.fluid.button {
    display: block;
    margin:0 auto;
}
.ui.fluid.button, .ui.fluid.buttons {
    width: 80%;
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
.ui.large.button, .ui.large.buttons .button, .ui.large.buttons .or {
    font-size: 1.14285714rem;
}
.ui.button, .ui.buttons .button, .ui.buttons .or {
    font-size: 1rem;
}
.ui.button {
    outline: 0 none;
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
    padding: 0;
}
[type=reset], [type=submit], button, html [type=button] {
    -webkit-appearance: button;
}
button, select {
    text-transform: none;
}
button, input {
    overflow: visible;
}
button, input, optgroup, select, textarea {
    font-family: sans-serif;
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
}
input:last-child {
  margin-bottom:30px;
}
.ui.large.button, .ui.large.buttons .button, .ui.large.buttons .or {
    font-size: 1.14285714rem;
}
.ui.card>.extra a:not(.ui), .ui.cards>.card>.extra a:not(.ui) {
    color: rgba(0,0,0,.4);
}
.ui.card>.content a:not(.ui), .ui.cards>.card>.content a:not(.ui) {
    color: '';
    -webkit-transition: color .1s ease;
    transition: color .1s ease;
}
.ui.card a, .ui.cards>.card a {
    display:block;
    cursor: pointer;
    width:100%;
    height:100%;
    line-height: 30px;
    text-align:center;
}
a {
    color: #4183c4;
    text-decoration: none;
    background-color: transparent;
    -webkit-text-decoration-skip: objects;
}
.ui.card>.extra button:hover a,
.ui.card>.extra button:active a{
    color: #1e70bf;
}
</style>