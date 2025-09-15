import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

// Pinia para manejar estado global (reminders, mes actual, etc.)
app.use(createPinia())

app.mount('#app')
