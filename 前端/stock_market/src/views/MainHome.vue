<template>
  <div class="content">
    <el-container>
      <el-main>
        <DataGrid />
        <UserDetail :user="props.user" v-if="props.ifLogin" />
      </el-main>
      <el-aside width="300px">
        <div class="aside-content">
          <div v-if="!props.ifLogin">
            <div class="login-tip">请先登录</div>
          </div>

          <div v-else>
            <PersonTrade :user="props.user"
            @tradeSuccess="handleTradeSuccess" />
          </div>
        </div>
      </el-aside>
    </el-container>
  </div>
</template>

<script setup>
import { defineProps, defineEmits} from 'vue';
import DataGrid from '../components/DataGrid.vue'
import PersonTrade from '../components/PersonTrade.vue'
import UserDetail from '../components/UserDetail.vue'

const emit = defineEmits(['tradeSuccess'])

const props = defineProps({
  user: Object,
  ifLogin: Boolean
})

function handleTradeSuccess() {
  emit('tradeSuccess')
}
</script>

<style scoped>
.content {
  padding-top: 80px;
}

.aside-content {
  height: 100%;
}

.login-tip {
  font-size: 20px;
  text-align: center;
  margin-top: 20px;
}
</style>