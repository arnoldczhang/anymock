<template>
  <article class="container">
    <main class="container__body">
      <el-empty v-if="!list.length" class="container__body--empty" />
      <template v-else>
        <section class="container__body--left">
          <section
            v-for="(item, index) in list"
            class="url__item"
            :key="item.url + index"
          >
            <span class="url__item--left">
              <TextOverflow :content="item.url" />
            </span>
            <span class="url__item--right">
              <el-link
                class="mr16"
                type="success"
                :underline="false"
                @click="handleAddMock(item)"
              >
                添加到mock
              </el-link>
              <el-link
                type="primary"
                :underline="false"
                @click="handleView(item)"
              >
                查看
              </el-link>
            </span>
          </section>
        </section>
        <section class="container__body--right">
          <JsonEditor v-model="jsonstr" />
        </section>
      </template>
    </main>
    <footer class="footer">
      <el-button
        :type="recording ? 'warning' : 'success'"
        size="small"
        class="mr8"
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
import useLogStore from '@/store/log';
import type { Log } from '@/types/mock.d';
import { reloadCurrentTab, runtime } from '@/utils/message';
import EVENT from '@/const/event';
import { api } from '@/service';

const store = useLogStore();
const { logs } = storeToRefs(store);
const jsonstr = ref('');
const recording = ref(Boolean(api.recorder.getState()));
const list = computed(() => logs.value);

const handleRecord = async () => {
  recording.value = !recording.value;
};

const handleAddMock = (log: Log) => {};

const handleView = (log: Log) => {
  try {
    jsonstr.value = JSON.stringify(JSON.parse(log.response), null, 2);
  } catch (err) {
    jsonstr.value = '{}';
  }
};

const handleVisibleChange = async () => {
  if (!document.hidden) {
    recording.value = Boolean(api.recorder.getState());
  }
};

watch(
  () => recording.value,
  async (on: boolean) => {
    api.recorder.updateState(on);
    if (on) {
      store.clear();
      reloadCurrentTab();
    }
    runtime.send({ type: EVENT.record_state, data: on });
  }
);

onMounted(() => {
  handleVisibleChange();
  document.addEventListener('visibilitychange', handleVisibleChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibleChange);
});
</script>
<style scoped lang="less">
.container {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  &__body {
    display: flex;
    height: calc(100vh - 86px);
    overflow-y: auto;
    margin-bottom: 8px;
    &--empty {
      height: 100%;
      width: 100%;
      &:extend(.border-box);
    }
    &--left {
      width: calc(~'60% - 8px');
      margin-right: 8px;
      overflow-y: auto;
      &:extend(.border-box);
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
          width: 20%;
          display: flex;
          justify-content: end;
        }
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
      &:extend(.border-box);
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
    &:extend(.border-box);
  }
}
</style>
