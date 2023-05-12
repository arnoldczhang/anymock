<template>
  <article class="container">
    <main class="container__body">
      <el-empty v-if="!list.length" class="container__body--empty" />
      <template v-else>
        <section class="container__body--left">
          <el-input
            v-model="search"
            class="search__input"
            :prefix-icon="Search"
          />
          <dl v-if="searchList.length" class="url__list">
            <dd
              v-for="(item, index) in searchList"
              class="url__item"
              :class="{ selected: item.id === currentMock.id }"
              :key="item.url + index"
            >
              <span class="url__item--left">
                <TextOverflow :content="item.url" @click="handleView(item)" />
              </span>
              <span class="url__item--right">
                <el-link v-if="item.used" class="mr8" type="info" disabled>
                  已添加
                </el-link>
                <el-link
                  v-else
                  class="mr8"
                  type="success"
                  :underline="false"
                  @click="handleAddMock(item)"
                >
                  +添加mock
                </el-link>
              </span>
            </dd>
          </dl>
          <el-empty v-else class="url__list--empty" />
        </section>
        <section class="container__body--right">
          <el-input class="editor__name" v-model="currentMock.url">
            <template #prepend>接口</template>
          </el-input>
          <JsonEditor
            v-model="currentMock.response"
            :style="{ height: 'calc(100% - 48px)' }"
          />
        </section>
      </template>
    </main>
    <footer class="footer">
      <el-button
        v-if="list.length"
        type="danger"
        size="small"
        :tabindex="-1"
        @click="handleClear"
      >
        清空日志
      </el-button>
      <el-button
        :type="recording ? 'warning' : 'success'"
        size="small"
        class="mr8"
        :tabindex="-1"
        :icon="recording ? VideoPause : VideoPlay"
        @click="handleRecord"
      >
        {{ recording ? '暂停录制' : '开始录制' }}
      </el-button>
    </footer>
  </article>
</template>
<script setup lang="ts">
import { Search, VideoPause, VideoPlay } from '@element-plus/icons-vue';
import { ElMessage as Message } from 'element-plus';

import EVENT from '@/const/event';
import { useTabActiveListener } from '@/hooks/useTabActiveListener';
import { useTableData } from '@/pages/home/useTableData';
import api from '@/service';
import useLogStore from '@/store/log';
import type { Log } from '@/types/mock.d';
import { getPathName } from '@/utils';
import { reloadCurrentTab, tab } from '@/utils/message';

const store = useLogStore();
const { logs, state } = storeToRefs(store);
const recording = ref(false);
const search = ref('');
const groupId = ref('');
const list = computed(() => logs.value);
const searchList = computed(() =>
  list.value.filter(({ url }) => !search.value || url.includes(search.value))
);
/**
 * 需新增的mock信息
 */
const currentMock = ref<Partial<Log>>({});

const { handleAddMockFromLog } = useTableData(computed(() => groupId.value));

const handleRecord = async () => {
  recording.value = !recording.value;
};

const handleAddMock = async (log: Log) => {
  try {
    let data = {};
    let name = '';
    if (currentMock.value.id === log.id) {
      name = currentMock.value.url || getPathName(log.url);
      data = JSON.parse(currentMock.value.response as string);
    } else {
      name = getPathName(log.url);
      data = JSON.parse(log.response);
    }
    handleAddMockFromLog(name, data);
    Message.success(`接口：${name} 添加成功`);
    log.used = true;
  } catch (err) {
    Message.error('json数据解析失败');
  }
};

const handleClear = () => {
  store.clear();
};

const handleView = (log: Log) => {
  try {
    // 记录pathname比较合理，url完全匹配比较难
    currentMock.value.url = getPathName(log.url);
    currentMock.value.response = JSON.stringify(
      JSON.parse(log.response),
      null,
      2
    );
  } catch (err) {
    currentMock.value.response = '返回内容非json，无法解析';
  } finally {
    currentMock.value.id = log.id as string;
  }
};

const init = async () => {
  groupId.value = await api.currentGroupId.get();
  recording.value = false;
};

watch(() => state.value, init);

watch(
  () => recording.value,
  async (on: boolean) => {
    tab.send({ type: EVENT.record_state, data: on }, () => {
      if (on) {
        store.clear();
        reloadCurrentTab();
      }
    });
  }
);

onBeforeUnmount(() => {
  tab.send({ type: EVENT.record_state, data: '' });
});

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
    display: flex;
    height: calc(100vh - 77px);
    overflow-y: auto;
    &--empty {
      height: 100%;
      width: 100%;
    }
    &--left {
      width: calc(~'60% - 8px');
      .search__input {
        width: 98%;
        box-sizing: border-box;
        margin: 8px;
      }
      .url__list {
        height: calc(~'100% - 48px');
        overflow-y: auto;
        &--empty {
          height: calc(~'100% - 48px');
        }
        .url__item {
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          line-height: 32px;
          height: 32px;
          padding: 0 8px;
          width: 100%;
          overflow: hidden;
          &--left {
            width: 80%;
          }
          &--right {
            box-sizing: border-box;
            width: 20%;
            display: flex;
            justify-content: end;
          }
          &.selected,
          &:hover {
            background-color: #f4f4f5;
          }
          .link--copy {
            font-size: 12px;
            flex-shrink: 0;
          }
        }
      }
    }
    &--right {
      width: 40%;
      box-sizing: border-box;
      padding-left: 4px;
      .editor {
        &__name {
          margin-top: 8px;
          margin-bottom: 8px;
        }
      }
    }
  }
  .sys-icon-add-box-fill {
    cursor: pointer;
  }
  .footer {
    border-top: 1px solid @border;
    display: flex;
    justify-content: end;
    padding: 10px 0;
  }
}
</style>
