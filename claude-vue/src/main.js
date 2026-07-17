import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'highlight.js/styles/github.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
