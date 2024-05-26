<template>
    <div class="user-content">
        <h2>用户数据</h2>
        <div class="user-info">
            <div class="user-info-item">
                <span class="info-label">用户名:</span>
                <span class="info-value">{{ props.user.username }}</span>
            </div>
            <div class="user-info-item">
                <span class="info-label">账户余额:</span>
                <span class="info-value">{{ props.user.balance }}</span>
            </div>
        </div>

        <div class="user-inventory">
            <h3>持仓信息</h3>
            <el-table :data="props.user.inventory" style="width: 100%"
                :default-sort="{ prop: 'Code', order: 'ascending' }">
                <el-table-column prop="Code" label="股票代码" sortable></el-table-column>
                <el-table-column prop="Amount" label="数量" sortable></el-table-column>
                <el-table-column prop="AVG_Cost" label="平均成本" sortable></el-table-column>
                <el-table-column prop="Total_Cost" label="总成本" sortable></el-table-column>
            </el-table>
        </div>

        <div class="trade-records">
            <h3>交易记录</h3>
            <el-table :data="props.user.tradeRecords" style="width: 100%"
                :default-sort="{ prop: 'TradeTime', order: 'descending' }" >
                <el-table-column prop="No" label="订单号" sortable></el-table-column>
                <el-table-column prop="Code" label="股票代码" sortable></el-table-column>
                <el-table-column prop="Amount" label="数量" sortable></el-table-column>
                <el-table-column prop="Price" label="价格" sortable></el-table-column>
                <el-table-column prop="Direction" label="方向" sortable :filters="[{ text: '买入', value: 0 }, { text: '卖出', value: 1 }]" :filter-method="filterDirection">
                    <template #default="{ row }">
                        {{ row.Direction === 0 ? '买入' : '卖出' }}
                    </template>
                </el-table-column>
                <el-table-column prop="State" label="状态" sortable :filters="[{ text: '错误', value: 0 }, { text: '委托成功', value: 1 }, { text: '交易成功', value: 2 }, { text: '废单', value: 3 }, { text: '账户余额不足', value: 4 }, { text: '持仓余额不足', value: 5 }]" :filter-method="filterState">
                    <template #default="{ row }">
                        {{ row.State === 0 ? '错误' : row.State === 1 ? '委托成功' : row.State === 2 ? '交易成功' : row.State === 3 ? '废单' : row.State === 4 ? '账户余额不足' : row.State === 5 ? '持仓余额不足' : '未知' }}
                    </template> 
                </el-table-column>
                <el-table-column prop="TradeTime" label="交易时间" sortable></el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    user: Object
})

function filterDirection(value, row) {
    return row.Direction === value;
}

function filterState(value, row) {
    return row.State === value;
}
</script>


<style scoped>
.user-content {
    margin: 50px 50px 0 250px;
}

.user-info {
    margin-bottom: 20px;
}

.user-info-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.info-label {
    font-weight: bold;
    margin-right: 5px;
}

.user-inventory,
.trade-records {
    margin-top: 20px;
}

h2,
h3 {
    color: #333;
}

h3 {
    margin-bottom: 10px;
}

.el-table {
    background-color: #f5f5f5;
    border-radius: 4px;
    padding: 10px;
}

.el-table th {
    background-color: #ebebeb;
    color: #333;
    font-weight: bold;
}

.el-table td {
    background-color: #fff;
}

.el-table-column--selection {
    width: 50px;
}

.el-table__empty-text {
    color: #999;
}
</style>