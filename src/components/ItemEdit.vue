<script lang="ts" setup>
import { type HmItem, ItemStatus } from '@/hs/hs-manage';
import useHomeworkStore from '@/store/homework';

const props = defineProps<{
  item: HmItem
}>();

const emit = defineEmits<{
  (event: 'finish'): void;
}>();

const homework = useHomeworkStore();

function change_status(ev: Event) {
  const value = (ev.target as HTMLInputElement).value;
  homework.set_item_status(value, props.item.id);
}

function change_estimated(ev: Event) {
  const val = (ev.target as HTMLInputElement).valueAsNumber;
  if (!(val >= 0))
    return;
  props.item.minutesEstimated = val;
  homework.store_hmo();
}

function change_spent(ev: Event) {
  const val = (ev.target as HTMLInputElement).valueAsNumber;
  if (!(val >= 0))
    return;
  props.item.minutesSpent = val;
  homework.store_hmo();
}

function change_progress(ev: Event) {
  const val = (ev.target as HTMLInputElement).valueAsNumber;
  if (!(val >= 0 && val <= 100))
    return;
  props.item.progress = val / 100;
  homework.store_hmo();
}

</script>

<template>
  <form @submit.prevent="emit('finish')">
    <div>
      <span>状态</span>
      <select @change="change_status" class="border-2" :value="item.status">
        <option :value="ItemStatus.NotStarted">未开始</option>
        <option :value="ItemStatus.Underway">进行中</option>
        <option :value="ItemStatus.Done">已完成</option>
        <option :value="ItemStatus.DoneEarlier">提前完成</option>
        <option :value="ItemStatus.NotMine">与我无关</option>
        <option :value="ItemStatus.Delayed">暂时不做</option>
      </select>
    </div>
    <div
      v-if="[ItemStatus.NotStarted, ItemStatus.Underway, ItemStatus.Done].includes(item.status)">
      <span>
        <span>预估时间(分钟)</span>
        <input
          type="number" min="0" step="any"
          :value="item.minutesEstimated" @input="change_estimated"
          class="border-2 w-20 pl-4">
      </span>
      <span class="mx-4">
        <span>已花费时间(分钟)</span>
        <input
          type="number" min="0" step="any"
          :value="item.minutesSpent" @input="change_spent"
          class="border-2 w-20 pl-4">
      </span>
      <span>
        <span>进度(%)</span>
        <input type="number" min="0" max="100" step="1" :value="item.progress * 100"
          @change="change_progress"
          class="border-2 w-20 pl-4">
      </span>
    </div>
    <div><button type="submit" class="btn bg-green-500">提交</button></div>
  </form>
</template>
