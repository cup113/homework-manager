import { defineStore } from 'pinia';
import { ref } from 'vue';

export default defineStore("now", () => {
  const now = ref(new Date());

  setInterval(() => {
    now.value = new Date();
  }, 335);

  return { now };
});
