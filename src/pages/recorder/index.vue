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
      <el-button type="success" size="small" class="mr8" @click="handleRecord">
        开始录制
      </el-button>
    </footer>
  </article>
</template>
<script setup lang="ts">
import { ElMessage as Message } from 'element-plus';
import { Ref } from 'vue';
import useLogStore from '@/store/log';
import { Url } from '@/types/mock.d';
import { getStorage, setStorage } from '@/utils/storage';
import { reloadCurrentTab } from '@/utils/message';

const store = useLogStore();
const list = computed(() => store.logs);

const handleRecord = async () => {
  store.clear();
  reloadCurrentTab();
};
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
  }
}
</style>
