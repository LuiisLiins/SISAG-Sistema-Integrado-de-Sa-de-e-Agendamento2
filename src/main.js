import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import '@flaticon/flaticon-uicons/css/all/all.css'
import api from './services/api'
import userStore from './store/userStore'

const app = createApp(App)

// Disponibilizar a API globalmente
app.config.globalProperties.$api = api

// Disponibilizar a userStore globalmente
app.config.globalProperties.$userStore = userStore

app.use(router).mount('#app')
