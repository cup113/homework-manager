<script lang="ts" setup>
import { ref } from 'vue';
import Message from 'vue-m-message';
import JsFileDownloader from 'js-file-downloader';

import useHomeworkStore from '@/store/homework';
import ItemDisplay from './ItemDisplay.vue';

const homework = useHomeworkStore();

const
  homeworkOnEdit = ref(false),
  homeworkContent = ref(homework.hmo.raw);

function homework_on_edit(ev: Event) {
  const content = (ev.target as HTMLTextAreaElement).value.trimStart();
  if (content.length === 0)
    return;
  homeworkContent.value = content;
  homework.try_compile(content);
  homework.store_hmo();
}

function export_homework() {
  const
    serializedHmo = homework.get_serialized_hmo(),
    content = JSON.stringify(serializedHmo, undefined, 4),
    url = URL.createObjectURL(new Blob([content])),
    d = new Date(),
    formattedDate = d.getFullYear().toString()
      + d.getMonth().toString().padStart(2, '0')
      + d.getDate().toString().padStart(2, '0'),
    filename = `homework-${formattedDate}.json`;
  new JsFileDownloader({
    url,
    filename,
    autoStart: true,
    contentType: "Application/json",
  });
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000 * 60);
}

function pull_from_source() {
  const SOURCE_STORE_KEY = "HM_Source";
  const source = prompt("请输入源", localStorage.getItem(SOURCE_STORE_KEY) ?? "");
  if (source === null)
    return;
  fetch(source).then(async res => {
    if (!res.ok) {
      return Promise.reject(`请求失败：${res.status} ${res.statusText}。`);
    }
    localStorage.setItem(SOURCE_STORE_KEY, source);
    try {
      return await res.text();
    } catch (err) {
      return Promise.reject(`读取内容失败：${err}`);
    }
  }).then(text => {
    homework.try_compile(text);
    homeworkContent.value = text;
  }).catch(err => {
    Message.error(`下载失败: ${err}`, {
      closable: true,
      duration: 60 * 1000,
    });
  });
}

function homework_on_upload(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.item(0);
  if (file === null || file === undefined)
    return;
  const reader = new FileReader();
  reader.readAsText(file, 'utf-8');
  reader.onload = () => {
    if (typeof reader.result !== 'string') {
      Message.error("读取文件失败。", {
        closable: true,
        duration: 30 * 100,
      });
      return;
    }
    homework.try_deserialize_hmo(reader.result);
    homework.store_hmo();
    homeworkContent.value = homework.hmo.raw;
  };
}

</script>

<template>
  <div class="homework-board p-4">
    <div>
      <button type="button" class="btn bg-gray-500"
        @click="homeworkOnEdit = !homeworkOnEdit">编辑内容</button>
      <button type="button" class="btn bg-blue-500" @click="export_homework">导出记录</button>
      <button type="button" class="btn bg-green-500" @click="pull_from_source">从源获取</button>
    </div>
    <div>
      <span>导入记录</span>
      <input type="file" accept=".json" @change="homework_on_upload">
    </div>
    <div v-show="homeworkOnEdit">
      <textarea class="border-4 h-40 w-full"
        @change="homework_on_edit">{{ homeworkContent }}</textarea>
    </div>
    <div>
      <div>作业系列ID {{ homework.meta.id }}</div>
      <div class="font-bold">作业日期 {{ homework.meta.date }}</div>
      <div class="font-bold">最后更新于 {{ homework.lastUpdated }}</div>
    </div>
    <div class="text-lg">
      <div v-for="subject in homework.subjects" :key="subject.name">
        <div class="text-xl font-bold progress-bg"
          :style="{ '--ratio': subject.progress }">
          <span>{{ subject.name }}</span>
          <span>
            {{ subject.minutesSpent.toFixed(0) }} / {{ subject.minutesEstimated.toFixed(0) }}
          </span>
        </div>
        <ItemDisplay v-for="item in subject.items" :item="item"></ItemDisplay>
      </div>
      <div>
        <div class="text-2xl">Notes</div>
        <div v-for="(note, i) in homework.hmo.notes" :key="i" class="ml-8">
          <span>[{{ i + 1 }}]&nbsp;</span>
          <span v-html="note"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.homework-board {
  img {
    @apply inline-block;
  }

  a {
    @apply underline text-blue-700;
  }
}
</style>
