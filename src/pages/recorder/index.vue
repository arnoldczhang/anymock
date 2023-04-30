<template>
  <article class="container">
    <main class="container__body">
      <el-empty v-if="!list.length" class="container__body--empty" />
      <template v-else>
        <section class="container__body--left">
          <section
            v-for="(item, index) in list"
            class="url__item"
            :class="{ selected: item.id === currentId }"
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
          </section>
        </section>
        <section class="container__body--right">
          <el-input class="editor__name" v-model="mockName">
            <template #prepend>接口名</template>
          </el-input>
          <JsonEditor
            v-model="jsonstr"
            :style="{ height: 'calc(100% - 48px)' }"
          />
        </section>
      </template>
    </main>
    <footer class="footer">
      <el-button type="danger" size="small" :tabindex="-1" @click="handleClear">
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
import { VideoPause, VideoPlay } from '@element-plus/icons-vue';
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
const currentId = ref('');
const recording = ref(false);
const groupId = ref('');
const list = computed(() => logs.value);
// 需新增的mock值
const jsonstr = ref('');
// 需新增的mock名
const mockName = ref('');

const { handleAddMockFromLog } = useTableData(computed(() => groupId.value));

const handleRecord = async () => {
  recording.value = !recording.value;
};

const handleAddMock = async (log: Log) => {
  try {
    const data = JSON.parse(jsonstr.value);
    const name = mockName.value || getPathName(log.url);
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
    const { url } = log;
    // 记录pathname比较合理，url完全匹配比较难
    mockName.value = getPathName(url);
    jsonstr.value = JSON.stringify(JSON.parse(log.response), null, 2);
  } catch (err) {
    jsonstr.value = '返回内容非json，无法解析';
  } finally {
    currentId.value = log.id as string;
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
      overflow-y: auto;
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
