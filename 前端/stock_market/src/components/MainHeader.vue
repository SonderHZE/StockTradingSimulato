<template>
    <div class="header">
        <div class="content-wrapper">
            <nav class="navigation">
                <a href="/" class="nav-link">首页</a>
                <div class="add-favorite" @click="addFavorite">收藏</div>
                <a href="https://acttg.eastmoney.com/pub/pctg_hskh_act_wysfpcb_01_01_01_0"
                    class="nav-link external">东方财富网</a>
                <a href="http://fund.eastmoney.com/" class="nav-link external">天天基金网</a>
                <a href="http://www.sse.com.cn/" class="nav-link external">上海证券交易所</a>
                <a href="http://www.szse.cn/" class="nav-link external">深圳证券交易所</a>
            </nav>
            <div class="user-actions">
                <el-dropdown trigger="click" class="user-dropdown">
                    <span class="user-dropdown-link">
                        {{ props.ifLogin ? '个人中心' : '登录/注册' }}
                        <el-icon class="icon-down">
                            <ArrowDown />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <!-- 用户名，详情页、余额 -->
                            <el-dropdown-item v-if="props.ifLogin" divided>用户名：{{ props.user.username }}</el-dropdown-item>
                            <el-dropdown-item v-if="props.ifLogin" divided>余额：{{ props.user.balance }}</el-dropdown-item>
                            <el-dropdown-item v-if="props.ifLogin" @click="logout"  divided>退出登录</el-dropdown-item>
                            <el-dropdown-item v-if="!props.ifLogin" @click="tryLogin = true">登录</el-dropdown-item>
                            <el-dropdown-item v-if="!props.ifLogin" @click="tryRegister = true">注册</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>

        <div>
            <el-dialog v-model="tryRegister" width="30%" title="注册" custom-class="custom-dialog">
                <el-form :model="form" :rules="rules" label-width="80px" class="registration-form">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="form.password" placeholder="请输入密码" show-password></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码" prop="confirmPassword">
                        <el-input v-model="form.confirmPassword" placeholder="请再次输入密码" show-password></el-input>
                    </el-form-item>
                    <el-button type="primary" @click="register" >注册</el-button>
                </el-form>
            </el-dialog>
        </div>

        <div>
            <el-dialog v-model="tryLogin" width="30%" title="登录" custom-class="custom-dialog">
                <el-form :model="loginForm" :rules="rules" label-width="80px" class="registration-form">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="loginForm.password" placeholder="请输入密码" show-password></el-input>
                    </el-form-item>
                    <el-button type="primary" @click="login" >登录</el-button>
                </el-form>
            </el-dialog>
        </div>

    </div>
</template>

<script setup>
import { defineProps, ref, watch, defineEmits} from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
const props = defineProps({
    user: Object,
    ifLogin: Boolean
})
const emit = defineEmits(['loginSuccess', 'logoutSuccess', 'getBalanceSuccess'])

watch(() => props.ifLogin, (newVal) => {
    if (newVal) {
        tryRegister.value = false
        tryLogin.value = false

        getBalance(props.user.username)
    }
})
watch(() => props.user, (newVal) => {
    if (newVal) {
        tryRegister.value = false
        tryLogin.value = false
    }
})

const tryRegister = ref(false)
const tryLogin = ref(false)

const form = ref({
    username: '',
    password: '',
    confirmPassword: ''
})
const loginForm = ref({
    username: '',
    password: ''
})

const rules = ref({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' }
    ]
})

function register() {
    if (form.value.password !== form.value.confirmPassword) {
        ElMessage.error('两次输入密码不一致')
        return
    }
    axios.get('api/regist', {
        params: {
            username: form.value.username,
            pwd: form.value.password
        }
    }).then(res => {
        if (res.data) {
            ElMessage.success('注册成功')
            tryRegister.value = false
        } else {
            ElMessage.error('注册失败')
        }
    }).catch(err => {
        console.error(err)
    })

}
function login(){
    axios.get('api/login', {
        params: {
            username: loginForm.value.username,
            pwd: loginForm.value.password
        }
    }).then(res => {
        if (res.data) {
            ElMessage.success('登录成功')
            tryLogin.value = false
            
            emit('loginSuccess', loginForm.value.username)
        } else {
            ElMessage.error('登录失败')
        }
    }).catch(err => {
        console.error(err)
    })
}
function logout() {
    axios.get('api/logout?username=' + props.user.username).then(res => {
        if (res.data) {
            ElMessage.success('退出登录成功')
            emit('logoutSuccess')
        } else {
            ElMessage.error('退出登录失败')
        }
    }).catch(err => {
        console.error(err)
    })
}
function addFavorite() {
    ElMessage.info('请按下 Ctrl+D 收藏本站')
}
function getBalance(username) {
    axios.get('api/getBalance?username=' + username).then(res => {
        if (res.data) {
            emit('getBalanceSuccess', res.data)
        } else {
            ElMessage.error('获取余额失败')
        }
    }).catch(err => {
        console.error(err)
    })
}
</script>

<style scoped>
.header {
    position: fixed;
    height: 50px;
    width: 100%;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 999;
}

.content-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 250px;
    max-width: 1400px;
    margin: 0 auto;

    line-height: 50px;
}

.navigation a.nav-link,
.navigation .add-favorite {
    font-size: 16px;
    margin-right: 20px;
    color: #333;
    transition: color 0.3s ease;
}

.add-favorite {
    display: inline-block;
    cursor: pointer;
}

.navigation a.external:hover {
    color: #007bff;
}

.add-favorite:hover {
    color: #ccc732;
}

.exchange {
    margin-right: 0;
}

.registration-form {
    width: 100%;
    max-width: 400px;
    margin: 50px auto;
  }
  
  .registration-form .el-form-item__label {
    color: #606266;
    font-weight: bold;
  }
  
  .registration-form .el-input {
    width: 100%;
  }
  
  .registration-form .el-button {
    width: 100%;
    margin-top: 20px;
  }

.user-actions {
    display: flex;
    align-items: center;
}

.registration-form .el-button.loading {
    background-color: #ccc;
    color: #fff;
    cursor: not-allowed;
  }

.user-dropdown {
    cursor: pointer;
}

.user-dropdown-link {
    display: flex;
    align-items: center;
    font-size: 16px;
    color: #333;
    gap: 5px;
}

.icon-down {
    font-size: 14px;
}
</style>