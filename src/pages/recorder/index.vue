<template>
  <article class="container">
    <main class="container__body">
      <el-empty v-if="!list.length" class="container__body--empty" />
      <template v-else>
        <section
          v-for="(item, index) in list"
          class="url__item"
          :key="item.url + index"
        >
          {{ item.url }}
        </section>
      </template>
    </main>
    <footer class="footer">
      <el-button
        :type="loading ? 'success' : 'warning'"
        :loading="loading"
        size="small"
        class="mr8"
        @click="handleRecord"
      >
        {{ loading ? '录制中' : '开始录制' }}
      </el-button>
    </footer>
  </article>
</template>
<script setup lang="ts">
import { ElMessage as Message } from 'element-plus';
import useLogStore from '@/store/log';
import { Url } from '@/types/mock.d';
import { getStorage, setStorage } from '@/utils/storage';
import { reloadCurrentTab } from '@/utils/message';

let timeout: any = null;
const store = useLogStore();
const { logs } = storeToRefs(store);
const loading = ref(false);
const list = computed(() => logs.value);

const handleRecord = async () => {
  store.clear();
  reloadCurrentTab();
};

const setLoading = () => {
  if (timeout) {
    clearTimeout(timeout);
  }
  loading.value = true;
  timeout = setTimeout(() => (loading.value = false), 1000);
};

watch(() => list.value, setLoading, { deep: true });
</script>
<style scoped lang="less">
.container {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  &__body {
    height: calc(100vh - 86px);
    padding: 16px;
    overflow-y: auto;
    margin-bottom: 8px;
    &:extend(.border-box);
    &--empty {
      height: 100%;
    }
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
    border-top: 1px solid @border;
    display: flex;
    justify-content: end;
    padding: 10px 0;
    &:extend(.border-box);
  }
}
</style>
