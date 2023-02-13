<script lang="ts" setup>
import { computed, ref } from 'vue';

import useTimeStore from '@/store/time';
import useHomeworkStore from '@/store/homework';

const time = useTimeStore();
const homework = useHomeworkStore();

const
  timeBackHome = computed(() => homework.hmo.timeBackHome),
  timeBackHomeDisplay = computed(() => timeBackHome.value.toLocaleString()),
  minutesBuffer = computed(() => homework.hmo.minutesBuffer),
  minutesBufferDisplay = computed(() => minutesBuffer.value.toString() + 'min'),
  minutesValid = computed(() => (
    (time.now.getTime() - timeBackHome.value.getTime()) / 60 / 1000
    - minutesBuffer.value
  )),
  minutesValidDisplay = computed(() => {
    if (minutesValid.value >= 0)
      return minutesValid.value.toFixed(1) + 'min';
    return "----";
  }),
  efficiency = computed(() => {
    let value = homework.totalDone / minutesValid.value;
    if (Number.isFinite(value))
      return value;
    return 0;
  }),
  efficiencyDisplay = computed(() => (efficiency.value * 100).toFixed(2) + '%'),
  backHomeOnEdit = ref(false),
  bufferOnEdit = ref(false);

function change_back_home(ev: Event) {
  let val = new Date((ev.target as HTMLInputElement).value);
  if (!isNaN(val.getFullYear()))
    homework.hmo.timeBackHome = new Date(val);
}

function change_buffer(ev: Event) {
  let val = (ev.target as HTMLInputElement).valueAsNumber;
  if (val >= 0)
    homework.hmo.minutesBuffer = val;
}

</script>

<template>
  <div class="overview-display text-3xl text-center my-16">
    <div>
      <span>到家时间</span>
      <span v-if="!backHomeOnEdit" @click="backHomeOnEdit = true;">{{ timeBackHomeDisplay }}</span>
      <span v-else>
        <input type="datetime-local" @change="change_back_home"
          @focusout="backHomeOnEdit = false;"
          @keypress.enter="change_back_home($event); backHomeOnEdit = false;">
      </span>
    </div>
    <div>
      <span>缓冲时间</span>
      <span v-if="!bufferOnEdit" @click="bufferOnEdit = true;">{{ minutesBufferDisplay }}</span>
      <span v-else>
        <input type="number" min="0" step="1" class="border-2 pl-4 w-20"
          :value="minutesBuffer" @change="change_buffer"
          @focusout="bufferOnEdit = false;"
          @keypress.enter="change_buffer($event); bufferOnEdit = false;">
        <span>分钟</span>
      </span>
    </div>
    <div>
      <span>有效时间</span>
      <span>{{ minutesValidDisplay }}</span>
    </div>
    <div>
      <span>作业效率</span>
      <span class="progress-bg" :style="{ '--ratio': efficiency }">{{ efficiencyDisplay }}</span>
    </div>
  </div>
</template>

<style lang="scss">
.overview-display>div {
  @apply flex mx-auto justify-center max-w-xl;

  >span:nth-child(1) {
    @apply w-52;
  }
  >span:nth-child(2) {
    @apply grow;
  }
}
</style>
