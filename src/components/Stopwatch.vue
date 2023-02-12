<script lang="ts" setup>
import { ref, computed } from 'vue';

import useTimeStore from '@/store/time';
import useHomeworkStore from '@/store/homework';

const homework = useHomeworkStore();
const time = useTimeStore();

const
  running = ref(false),
  lastStartTime = ref(time.now),
  msPrevAcc = ref(0),
  msTotal = computed(() => {
    if (!running.value)
      return msPrevAcc.value;
    return time.now.getTime() - lastStartTime.value.getTime() + msPrevAcc.value;
  }),
  msDisplay = computed(() => {
    let t = Math.floor(msTotal.value / 1000);
    let m = "", s = "";
    s = (t % 60).toString().padStart(2, '0');
    t = Math.floor(t / 60);
    m = (t % 60).toString().padStart(2, '0');
    t = Math.floor(t / 60);
    if (t == 0)
      return `${m}:${s}`;
    return `${t}:${m}:${s}`;
  });

function start() {
  running.value = true;
  lastStartTime.value = time.now;
}

function pause() {
  msPrevAcc.value = msTotal.value;
  running.value = false; // This will change `msTotal.value`
}

function start_or_pause() {
  if (running.value)
    pause();
  else
    start();
}

function update_selected(progress: number) {
  let selectedItem = homework.get_selected_item();
  if (selectedItem === undefined)
    return;
  selectedItem.minutesSpent += msTotal.value / 1000 / 60;
  homework.store_hmo();
  if (progress >= 0 && progress <= 1)
    selectedItem.progress = progress;
}

function complete() {
  update_selected(1);
  msPrevAcc.value = 0;
  running.value = false;
}

function abort() {
  const progress = prompt("请输入当前进度(%)");
  if (progress === null)
    return;
  update_selected(parseInt(progress) / 100);
  msPrevAcc.value = 0;
  running.value = false;
}

</script>

<template>
  <div
    class="stopwatch w-full h-screen bg-green-800 text-center flex items-center justify-center flex-col">
    <div class="text-white text-[20vw] font-bold">{{ msDisplay }}</div>
    <div class="text-lg">
      <button type="button" class="btn"
        :class="running ? 'bg-orange-500' : 'bg-green-500'"
        @click="start_or_pause">
        <span v-if="!running">开始</span>
        <span v-else>暂停</span>
      </button>
      <button type="button" class="btn bg-blue-500 mx-4" @click="complete">完成</button>
      <button type="button" class="btn bg-red-500" @click="abort">中止</button>
    </div>
  </div>
</template>

<style lang="scss">
</style>
