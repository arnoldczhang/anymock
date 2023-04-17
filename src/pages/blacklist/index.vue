<template>
  <article class="container">
    <main class="container__body">
      <section v-for="(item, index) in list" class="url__item" :key="item.key">
        <el-input v-model="item.url">
          <template #prepend>{{ index + 1 }}</template>
        </el-input>
        <el-button
          type="danger"
          size="small"
          class="ml8 link--copy"
          @click="handleDelete(index)"
        >
          删除
        </el-button>
        <el-button
          type="primary"
          size="small"
          class="ml8 link--copy"
          @click="handleCopy(index)"
        >
          复制当前
        </el-button>
      </section>
    </main>
    <footer class="footer">
      <el-button type="primary" @click="handleAdd">新增黑名单</el-button>
      <el-button v-if="list.length" type="success" @click="handleSave">
        保存
      </el-button>
      <el-button type="danger" @click="($event) => handleDelete()">
        清空
      </el-button>
    </footer>
  </article>
</template>
<script setup lang="ts">
import { ElMessage as Message } from 'element-plus';
import { Ref } from 'vue';
import { Url } from '@/types/mock.d';
import { getStorage, setStorage } from '@/utils/storage';
import { genBlackListItem } from '@/utils';
import { getCurrentUrl } from '@/utils/message';
import { BLACKLIST_KEY } from '@/const/storageKey';

const list: Ref<Url[]> = ref([]);

const handleAdd = async () => {
  list.value.push(genBlackListItem(await getCurrentUrl()));
  await handleSave();
};

const handleSave = async () => {
  await setStorage(BLACKLIST_KEY, toRaw(list.value));
  Message({
    type: 'success',
    message: '操作成功，请刷新页面',
  });
};

const handleCopy = async (index: number) => {
  list.value[index].url = await getCurrentUrl();
};

const handleDelete = async (index?: number) => {
  if (typeof index !== 'undefined') {
    list.value.splice(index, 1);
  } else {
    list.value = [];
  }
  await handleSave();
};

onMounted(async () => {
  list.value = await getStorage(BLACKLIST_KEY, []);
});
</script>
<style scoped lang="less">
.container {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  &__body {
    height: calc(100vh - 64px);
    padding: 16px;
    overflow-y: auto;
  }
  .sys-icon-add-box-fill {
    cursor: pointer;
  }
  .url__item {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    .link--copy {
      font-size: 12px;
      flex-shrink: 0;
    }
  }
  .footer {
    display: flex;
    justify-content: end;
    padding: 10px 0;
  }
}
</style>
