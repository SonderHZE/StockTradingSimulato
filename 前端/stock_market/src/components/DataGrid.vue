<template>
    <div class="chart_container">
        <div class="header d-flex align-items-center justify-content-between">
            <h2 class="mb-0">股票信息</h2>
            <div class="countdown-btn-container">
                <span class="countdown-text pulse">刷新倒计时：{{ countDown / 1000 }}s</span>
            </div>
        </div>
        <el-tooltip content="请关闭所有折线图后才能更换" placement="top">
            <el-select 
            :disabled="openExpandRows.length > 0"
            v-model="activeName" 
            placeholder="请选择" 
            class="mt-3 select-with-transition">
            <el-option label="沪市" value="1"></el-option>
            <el-option label="深市" value="2"></el-option>
            <el-option label="创业板" value="3"></el-option>
            </el-select>
        </el-tooltip>
        <el-row class="statistics-row">
            <el-col :span="12">
                <div class="statistics-title">总市值：</div>
                <div class="statistics-content">{{ activeName === '1' ? shTotalMarketValue : activeName === '2' ? szTotalMarketValue : cybTotalMarketValue }}元</div>
            </el-col>
            <el-col :span="12">
                <div class="statistics-title">平均涨幅：</div>
                <div class="statistics-content">{{ activeName === '1' ? shAverageIncrease : activeName === '2' ? szAverageIncrease : cybAverageIncrease }}</div>
            </el-col>
        </el-row>

        <el-table stripe border 
            @expand-change="handleClickExpand"
            :data="activeName === '1' ? shData : activeName === '2' ? szData : cybData"
            :expand-row-keys="openExpandRows" row-key="Code"
            style="width: 100%; margin-top: 15px">
            <el-table-column type="expand">
                <template #default="{ row }">
                    <StockChart :stock="row" />
                </template>
            </el-table-column>

            <el-table-column prop="Code" label="代码" sortable></el-table-column>
            <el-table-column prop="Name" label="名称" sortable></el-table-column>
            <el-table-column prop="initPrice" label="初始价格" sortable>
                <template #default="{ row }">
                    <span>{{ initPrice[row.Code] }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="Price" label="最新价格" sortable>
                <template #default="{ row }">
                    <span :style="{ color: row.Price > initPrice[row.Code] ? 'red' : 'green' }">{{ row.Price }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="ChangeAmount" label="涨跌价" sortable>
                <template #default="{ row }">
                    <span :style="{ color: row.ChangeAmount > 0 ? 'red' : 'green' }">{{ row.ChangeAmount }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="ChangeRatio" label="涨跌幅" sortable>
                <template #default="{ row }">
                    <span :style="{ color: row.ChangeAmount > 0 ? 'red' : 'green' }">{{ row.ChangeRatio }}</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import StockChart from './StockChart.vue'

const shData = ref([]);
const szData = ref([]);
const cybData = ref([]);
const initPrice = ref([]);

const countDown = ref(5000);
const activeName = ref('1');
// 新增数据统计变量
const shTotalMarketValue = ref(0);
const szTotalMarketValue = ref(0);
const cybTotalMarketValue = ref(0);
const shAverageIncrease = ref(0);
const szAverageIncrease = ref(0);
const cybAverageIncrease = ref(0);


const openExpandRows = ref([]);


onMounted(() => {
    getMarketPrice();
});

watch(countDown, (val) => {
    if (val <= 0) {
        getMarketPrice();
        countDown.value = 5000;
    }
});

watch(activeName, () => {
    openExpandRows.value = [];
});

setInterval(() => {
    countDown.value -= 1000;
}, 1000);

function getMarketPrice() {
    axios.get('api/getMarketPrice').then(res => {
        // 通过代码判断是沪市、深市还是创业板，同时计算涨跌幅和涨跌价
        shData.value = res.data.filter(item => item.Code.startsWith('6')).map(item => {
            // 第一次获取数据时，将初始价格设置为最新价格
            if (!initPrice.value[item.Code]) {
                initPrice.value[item.Code] = item.Price;
            }
            //保留两位小数
            item.ChangeRatio = ((item.Price - initPrice.value[item.Code]) / initPrice.value[item.Code] * 100).toFixed(2) + '%';
            item.ChangeAmount = (item.Price - initPrice.value[item.Code]).toFixed(2);

            shAverageIncrease.value = ((item.Price - initPrice.value[item.Code]) / initPrice.value[item.Code] * 100).toFixed(2) + '%';
            shTotalMarketValue.value += item.Price;
            
            return item;
        });

        szData.value = res.data.filter(item => item.Code.startsWith('0')).map(item => {
            if (!initPrice.value[item.Code]) {
                initPrice.value[item.Code] = item.Price;
            }
            item.ChangeRatio = ((item.Price - initPrice.value[item.Code]) / initPrice.value[item.Code] * 100).toFixed(2) + '%';
            item.ChangeAmount = (item.Price - initPrice.value[item.Code]).toFixed(2);

            szTotalMarketValue.value += item.Price;
            szAverageIncrease.value = ((item.Price - initPrice.value[item.Code]) / initPrice.value[item.Code] * 100).toFixed(2) + '%';

            return item;

        });

        cybData.value = res.data.filter(item => item.Code.startsWith('3')).map(item => {
            if (!initPrice.value[item.Code]) {
                initPrice.value[item.Code] = item.Price;
            }
            item.ChangeRatio = ((item.Price - initPrice.value[item.Code]) / initPrice.value[item.Code] * 100).toFixed(2) + '%';
            item.ChangeAmount = (item.Price - initPrice.value[item.Code]).toFixed(2);

            cybTotalMarketValue.value += item.Price;
            cybAverageIncrease.value = ((item.Price - initPrice.value[item.Code]) / initPrice.value[item.Code] * 100).toFixed(2) + '%';

            return item;
        });
    });
}


function handleClickExpand(row) {
    // 将展开的行的Code存入openExpandRows
    if (openExpandRows.value.includes(row.Code)) {
        openExpandRows.value = openExpandRows.value.filter(item => item !== row.Code);
    } else {
        openExpandRows.value.push(row.Code);
    }
}
</script>

<style scoped>
.chart_container {
    margin: 0px 50px 0 250px;
}

.countdown-text.pulse {
    animation: pulse 1s infinite;
    
    color: #b14415;
    font-size: 16px;
}

@keyframes pulse {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.8;
    }

    100% {
        opacity: 1;
    }
}

.select-with-transition {
    transition: all 0.3s ease;
}

.statistics-title {
    font-size: 12px;
    color: #606266;
}

.statistics-content {
    font-size: 20px;
    color: #303133;
    margin-top: 5px;
    font-weight: bold;
    transition: color 0.3s ease;
}

.el-table tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.d-flex {
    display: flex;
}

.align-items-center {
    align-items: center;
}

.justify-content-between {
    justify-content: space-between;
}

.mt-3 {
    margin-top: 15px;
}

.countdown-btn-container {
    display: flex;
    align-items: center;
}

.statistics-row {
    margin-top: 15px;
}

.chart-placeholder {
    text-align: center;
    font-size: 18px;
    color: #999;
    line-height: 200px;
}
</style>