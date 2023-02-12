<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ItemStatus, type HmItem } from '@/hs/hs-manage';
import useHomeworkStore from '@/store/homework';
import ItemEdit from './ItemEdit.vue';

const props = defineProps<{
  item: HmItem,
}>();

const homework = useHomeworkStore();

const
  selected = computed(() => homework.selectedId === props.item.id),
  edited = ref(false),
  statusDisplay = computed(() => {
    switch (props.item.status) {
      case ItemStatus.NotStarted:
      case ItemStatus.Underway:
      case ItemStatus.Done:
        return `${props.item.minutesSpent.toFixed(0)} / ${props.item.minutesEstimated.toFixed(0)}`;
      case ItemStatus.DoneEarlier:
        return 'E';
      case ItemStatus.NotMine:
        return '/';
      case ItemStatus.Delayed:
        return 'D';
    }
  }),
  statusClassIndex = computed(() => {
    switch (props.item.status) {
      case ItemStatus.NotStarted: return 0;
      case ItemStatus.Underway: return 1;
      case ItemStatus.Done: return 2;
      case ItemStatus.DoneEarlier: return 3;
      case ItemStatus.NotMine: return 4;
      case ItemStatus.Delayed: return 5;
    }
  });

function switch_select() {
  if (edited.value) {
    edited.value = false;
    homework.select_item(undefined);
    return;
  }
  if (selected.value) {
    edited.value = true;
    return;
  }
  homework.select_item(props.item);
}

</script>

<template>
  <div class="ml-8" v-if="item.deleted === undefined">
    <div @click="switch_select" class="cursor-pointer progress-bg"
      :class="edited ? 'bg-green-300' : (selected ? 'bg-green-100' : undefined)"
      :style="{ '--ratio': item.progress }">
      <input type="checkbox" class="w-5 h-5" :checked="selected">
      <span class="badge mx-2"
        :class="['bg-orange-600', 'bg-yellow-600', 'bg-green-600',
        'bg-cyan-600', 'bg-purple-500', 'bg-red-600'][statusClassIndex]">
        {{ statusDisplay }}
      </span>
      <span v-html="item.text"></span>
    </div>
    <ItemEdit v-if="edited" :item="item" @finish="switch_select"></ItemEdit>
  </div>
</template>
