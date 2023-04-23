<template>
  <article class="container">
    <main class="container__body">
      <el-empty v-if="!list.length" class="container__body--empty" />
      <template v-else>
        <section v-for="item in list" class="url__item" :key="item.key" />
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
import { Url } from '@/types/mock.d';
import { getStorage, setStorage } from '@/utils/storage';
import { genBlackListItem } from '@/utils';
import { getCurrentUrl } from '@/utils/message';
import { BLACKLIST_KEY } from '@/const/storageKey';

const list: Ref<Url[]> = ref([]);

const handleRecord = async () => {};

onMounted(async () => {});
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
