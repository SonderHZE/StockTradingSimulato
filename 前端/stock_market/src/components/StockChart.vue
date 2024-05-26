<template>
    <div ref="chart" class="chart"></div>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
</template>

<script setup>
import { onMounted, ref, defineProps, onBeforeUnmount, reactive } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';
import moment from 'moment';

const chart = ref(null);
const props = defineProps({
    stock: Object,
});
let myChart = null;
const increasePriceRatio = ref([]);
let stockPriceInterval = null;
const state = reactive({
    errorMessage: '',
});

const initChart = () => {
    if (!chart.value) return;

    // 初始化 ECharts 实例
    myChart = echarts.init(chart.value);

    // 设定图表配置项
    const option = {
        xAxis: {
            type: 'category',
            boundaryGap: false,
            name: '时间',
            data: [],
        },
        yAxis: [
            {
                type: 'value',
                name: '价格',
            },
            {
                type: 'value',
                name: '涨幅',
                axisLabel: {
                    formatter: '{value}%',
                },
            },
        ],
        series: [
            {
                data: [],
                type: 'line',
                smooth: true,
                areaStyle: {},
                emphasis: {
                    focus: 'series',
                },
                yAxisIndex: 0, // 使用第一个 y 轴
            },
            {
                data: [],
                type: 'line',
                smooth: true,
                areaStyle: {},
                emphasis: {
                    focus: 'series',
                },
                yAxisIndex: 1, // 使用第二个 y 轴
            },
        ],
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                const price = params[0].value;
                const increase = params[1].value;
                return `价格：${price}<br>涨幅：${increase}%`;
            },
        },
        dataZoom: [
            {
                type: 'slider',
                start: 0,
                end: 100,
            },
        ],
        toolbox: {
            feature: {
                saveAsImage: {
                    show: true,
                    title: '保存为图片',
                },
                restore: {
                    show: true,
                    title: '重置',
                },
                magicType: {
                    show: true,
                    type: ['line', 'bar'],
                    title: {
                        line: '切换为折线图',
                        bar: '切换为柱状图',
                    },
                },
            },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
    };

    myChart.setOption(option);
};
// 数据每5秒更新一次
const generateDateSequence = (length) => {
    const now = moment();
    const dates = [];
    for (let i = 0; i < length; i++) {
        dates.push(now.subtract(5, 'seconds').format('HH:mm:ss'));
    }
    return dates.reverse();
};

onMounted(() => {
    initChart();
    stockPriceInterval = setInterval(() => {
        getStockPrice();
    }, 5000); // 设置定时器，并保存引用
});

onBeforeUnmount(() => {
    // 清理定时器
    if (stockPriceInterval) {
        clearInterval(stockPriceInterval);
        stockPriceInterval = null;
    }

    // 销毁ECharts实例
    if (myChart) {
        myChart.dispose();
        myChart = null;
    }
});

const updateChart = (prices) => {
    if (!Array.isArray(prices) || prices.length === 0) {
        state.errorMessage = '数据格式错误或为空';
        return;
    }

    // 生成对应的日期序列
    const dates = generateDateSequence(prices.length);

    // 根据价格更新涨幅
    increasePriceRatio.value = prices.map((price, index) => {
        if (index === 0) return 0;
        return ((price - prices[index - 1]) / prices[index - 1] * 100).toFixed(2);
    });

    // 结合日期和价格更新图表
    myChart.setOption({
        xAxis: {
            data: dates,
        },
        series: [
            {
                data: prices,
            },
            {
                data: increasePriceRatio.value,
            },
        ],
    });
};

const getStockPrice = async () => {
    try {
        const res = await axios.get(`api/getStockPrice?code=${props.stock.Code}`);
        state.errorMessage = ''; // 清除错误信息
        updateChart(res.data);
    } catch (error) {
        console.error('Error fetching stock price:', error);
        state.errorMessage = '获取股票价格失败，请稍后再试';
    }
};



// 首次加载数据
getStockPrice();
</script>

<style scoped>
.chart {
    width: 98%;
    height: 400px;
}

.error-message {
    color: red;
    margin-top: 10px;
}
</style>