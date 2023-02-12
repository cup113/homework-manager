import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Message from 'vue-m-message';

import './style.scss';
import 'vue-m-message/dist/style.css'
import App from './App.vue';

const app = createApp(App);
app.use(createPinia());
app.use(Message);
app.mount('#app');
