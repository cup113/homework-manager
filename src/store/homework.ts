import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Message from 'vue-m-message';

import { default_hm_object, hm_compile, hm_deserialize, hm_serialize } from '@/hs/hs-manage';
import type { HmItem, StoredHmObject } from '@/hs/hs-manage';

export default defineStore('homework', () => {
  const RAW_HOMEWORK_STORE_KEY = "HM_RawHomework";
  const HMO_STORE_KEY = "HM_Hmo";

  const
    hmo = ref(default_hm_object()),
    meta = computed(() => hmo.value.meta),
    lastUpdated = computed(() => {
      if (meta.value.modifies.length === 0)
        return meta.value.created;
      return meta.value.modifies[meta.value.modifies.length - 1].time
    }),
    subjects = computed(() => hmo.value.subjects.map(subject => {
      const
        minutesSpent = subject.items.reduce((pre, cur) => pre + cur.minutesSpent, 0),
        minutesDone = subject.items.reduce((pre, cur) => {
          return pre + cur.minutesEstimated * cur.progress;
        }, 0),
        minutesEstimated = subject.items.reduce((pre, cur) => pre + cur.minutesEstimated, 0),
        progress = minutesDone / minutesEstimated;
      return {
        ...subject,
        minutesSpent,
        minutesDone,
        minutesEstimated,
        progress,
      };
    })),
    itemsMap = computed(() => {
      let mp = new Map<string, HmItem>();
      for (const subject of subjects.value) {
        for (const item of subject.items)
          mp.set(item.id, item);
      }
      return mp;
    }),
    totalDone = computed(() => subjects.value.reduce((pre, cur) => pre + cur.minutesDone, 0)),
    totalEstimation = computed(
      () => subjects.value.reduce((pre, cur) => pre + cur.minutesEstimated, 0)
    ),
    selectedId = ref(undefined as undefined | string);

  function try_compile(raw: string): void {
    try {
      const obj = hm_compile(raw, hmo.value);
      hmo.value = obj;
      localStorage.setItem(RAW_HOMEWORK_STORE_KEY, raw);
    } catch (err) {
      console.error(err);
      Message.error("解析作业XML时出现错误: " + err, {
        closable: true,
        duration: 60 * 1000,
      });
    }
  }

  function get_serialized_hmo(): StoredHmObject {
    return hm_serialize(hmo.value);
  }

  function store_hmo(): void {
    localStorage.setItem(HMO_STORE_KEY, JSON.stringify(get_serialized_hmo()));
  }

  function try_deserialize_hmo(content: string): void {
    try {
      hmo.value = hm_deserialize(JSON.parse(content) as StoredHmObject);
    } catch (err) {
      console.error(err);
      Message.error("解析作业JSON时出现错误: " + err, {
        closable: true,
        duration: 60 * 1000,
      });
    }
  }

  function select_item(item?: HmItem): void {
    selectedId.value = item?.id;
  }

  function get_selected_item(): HmItem | undefined {
    if (selectedId.value === undefined)
      return undefined;
    return itemsMap.value.get(selectedId.value);
  }

  (() => {
    const storedHmo = localStorage.getItem(HMO_STORE_KEY);
    if (storedHmo != null)
      try_deserialize_hmo(storedHmo);
  })();

  return {
    hmo,
    meta,
    lastUpdated,
    subjects,
    totalEstimation,
    totalDone,
    selectedId,
    get_selected_item,
    try_compile,
    get_serialized_hmo,
    try_deserialize_hmo,
    store_hmo,
    select_item,
  };
});
