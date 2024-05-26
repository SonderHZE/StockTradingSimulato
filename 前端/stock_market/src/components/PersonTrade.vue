<template>
    <div class="person-trade">
        <div class="trade-container">
            <div class="trade-card">
                <h3>买入</h3>
                <form :model="buyForm" class="trade-form">
                    <div class="form-group">
                        <label for="buy-code">股票代码</label>
                        <input id="buy-code" v-model="buyForm.code" rules="required" />
                    </div>
                    <div class="form-group">
                        <label for="buy-price">挂单价格</label>
                        <input id="buy-price" v-model="buyForm.price" />
                    </div>
                    <div class="form-group">
                        <label for="buy-amount">挂单数量</label>
                        <input id="buy-amount" v-model="buyForm.amount" />
                    </div>
                    <button type="button" @click="buy">买入</button>
                </form>
            </div>

            <div class="trade-card">
                <h3>卖出</h3>
                <form :model="sellForm" class="trade-form">
                    <div class="form-group">
                        <label for="sell-code">股票代码</label>
                        <input id="sell-code" v-model="sellForm.code" />
                    </div>
                    <div class="form-group">
                        <label for="sell-price">挂单价格</label>
                        <input id="sell-price" v-model="sellForm.price" />
                    </div>
                    <div class="form-group">
                        <label for="sell-amount">挂单数量</label>
                        <input id="sell-amount" v-model="sellForm.amount" />
                    </div>
                    <button type="button" @click="sell">卖出</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['tradeSuccess'])
const props = defineProps({
    user: Object,
})

const buyForm = ref({
    code: '',
    price: '',
    amount: '',
})

const sellForm = ref({
    code: '',
    price: '',
    amount: '',
})

function checkForm(form) {
    for (const key in form) {
        if (!form[key]) {
            return false
        }
    }
    return true
}

// 错误=0，		//系统无用户/用户名不存在/股票代码不存在等情况时
// 委托成功=1，	//买入价低于最新价，或卖出价高于最新价，只记录委托成功，后续不会自动成交
// 交易成功=2，	//以最新价买入或卖出
// 废单=3，		//买入价或卖出价超出价格变动范围
// 账户余额不足=4，//账户余额不支持当次交易
// 持仓余额不足=5	//持仓数量不支持当次交易

function buy(){
    if(!checkForm(buyForm.value)){
        ElMessage.error('请填写完整信息')
        return
    }
    axios.get('api/trade', {
        params: {
            username: props.user.username,
            code: buyForm.value.code,
            direction: "buy",
            price: buyForm.value.price,
            amount: buyForm.value.amount
        }
    }).then(res => {
        if(res.data === 1){
            ElMessage.success('委托成功')
        }else if(res.data === 2){
            ElMessage.success('交易成功')
            emit('tradeSuccess')
        }else if(res.data === 3){
            ElMessage.error('买入价或卖出价超出价格变动范围')
        }else if(res.data === 4){
            ElMessage.error('账户余额不足')
        }else if(res.data === 5){
            ElMessage.error('持仓余额不足')
        }else{
            ElMessage.error('系统无用户/用户名不存在/股票代码不存在等情况')
        }
    })
}

function sell(){
    if(!checkForm(sellForm.value)){
        ElMessage.error('请填写完整信息')
        return
    }

    axios.get('api/trade', {
        params: {
            username: props.user.username,
            code: sellForm.value.code,
            direction: "sell",
            price: sellForm.value.price,
            amount: sellForm.value.amount
        }
    }).then(res => {
        if(res.data === 1){
            ElMessage.success('委托成功')
        }else if(res.data === 2){
            ElMessage.success('交易成功')
            emit('tradeSuccess')
        }else if(res.data === 3){
            ElMessage.error('买入价或卖出价超出价格变动范围')
        }else if(res.data === 4){
            ElMessage.error('账户余额不足')
        }else if(res.data === 5){
            ElMessage.error('持仓余额不足')
        }else{
            ElMessage.error('系统无用户/用户名不存在/股票代码不存在等情况')
        }
    })
}
</script>

<style scoped>
.person-trade {
    padding: 20px;
}

.trade-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.trade-card {
    background-color: #f5f5f5;
    padding: 20px;
    border-radius: 5px;
}

.trade-card h3 {
    margin-bottom: 10px;
}

.trade-form {
    display: grid;
    gap: 10px;
}

.form-group {
    display: grid;
    gap: 5px;
}

label {
    font-weight: bold;
}

input {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
}

button {
    padding: 5px 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}
</style>
