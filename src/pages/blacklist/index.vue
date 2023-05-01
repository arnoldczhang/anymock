<template>
  <article class="container">
    <main class="container__body">
      <el-empty v-if="!list.length" class="container__body--empty" />
      <template v-else>
        <section
          v-for="(item, index) in list"
          class="url__item"
          :key="item.key"
        >
          <el-input v-model="item.url">
            <template #prepend>{{ index + 1 }}</template>
          </el-input>
          <el-button
            type="primary"
            size="small"
            class="ml8 link--copy"
            @click="handleCopy(index)"
          >
            复制当前
          </el-button>
          <el-button
            type="danger"
            size="small"
            class="ml8 link--copy"
            @click="handleDelete(index)"
          >
            删除
          </el-button>
        </section>
      </template>
    </main>
    <footer class="footer">
      <el-button
        type="danger"
        size="small"
        :tabindex="-1"
        @click="() => handleDelete()"
      >
        清空黑名单
      </el-button>
      <el-button type="primary" size="small" :tabindex="-1" @click="handleAdd">
        +新增黑名单
      </el-button>
      <el-button
        v-if="list.length"
        size="small"
        type="success"
        class="mr8"
        @click="handleSave"
      >
        保存
      </el-button>
    </footer>
  </article>
</template>
<script setup lang="ts">
import { ElMessage as Message } from 'element-plus';
import { Ref } from 'vue';

import { useTabActiveListener } from '@/hooks/useTabActiveListener';
import api from '@/service';
import { Url } from '@/types/mock.d';
import { genBlackListItem } from '@/utils';
import { getCurrentUrl } from '@/utils/message';

const list: Ref<Url[]> = ref([]);

const handleAdd = async () => {
  list.value.push(genBlackListItem(await getCurrentUrl()));
  await handleSave();
};

const handleSave = async () => {
  await api.blacklist.update(toRaw(list.value));
  Message.success('操作成功，请刷新页面');
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

const init = async () => {
  list.value = await api.blacklist.get([]);
};

onMounted(init);
useTabActiveListener(init);
</script>
<style scoped lang="less">
.container {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  &:extend(.border-box);
  &__body {
    height: calc(100vh - 86px);
    padding: 16px;
    overflow-y: auto;
    margin-bottom: 8px;
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
