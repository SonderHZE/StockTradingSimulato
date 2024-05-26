<template>
  <div id="app">
    <MainHeader :user="user" :ifLogin="ifLogin"
                @loginSuccess="handleLoginSuccess" 
                @logoutSuccess="handleLogoutSuccess"
                @getBalanceSuccess="handleGetBalance"/>
    <Home :user="user" :ifLogin="ifLogin"
          @tradeSuccess="handleTradeSuccess"/>

  </div>
  
</template>

<script setup>
import Home from './views/MainHome.vue'
import MainHeader from './components/MainHeader.vue'
import{ ref, watch } from 'vue'
import axios from 'axios';
const user = ref({
  username: '',
  inventory: [],
  tradeRecords: [],
  balance: 0
});
const ifLogin = ref(false);
function handleLoginSuccess(username) {
  user.value.username = username;
  ifLogin.value = true;
}
function handleLogoutSuccess() {
  user.value = {
    username: '',
    inventory: [],
    tradeRecords: [],
    balance: 0
  };
  ifLogin.value = false;
}
function handleGetBalance(balance) {
  user.value.balance = balance;
}
function handleTradeSuccess() {
  axios.get('api/getBalance', {
    params: {
      username: user.value.username
    }
  }).then(res => {
    user.value.balance = res.data;
  });
} 
function getInventory(){
    axios.get('api/getInventory', {
        params: {
            username: user.value.username
        }
    }).then(res => {
        user.value.inventory = res.data;
    });
}
function getTradeRecord(){
    axios.get('api/getTradeRecord', {
        params: {
            username: user.value.username
        }
    }).then(res => {
        user.value.tradeRecords = res.data;
    });
}

// 监视是否登录,如果已登录则每5秒获取一次持仓信息和交易记录,否则销毁计时器
watch(ifLogin, (newVal) => {
    if (newVal) {
        getInventory()
        getTradeRecord()
        setInterval(() => {
            if(!ifLogin.value){
                clearInterval()
                return
            }
            getInventory()
            getTradeRecord()
        }, 5000)
    }
});
</script>

<style>
* {
  padding: 0;
  margin: 0;
}

#app {
  width: 100%;
}
</style>
