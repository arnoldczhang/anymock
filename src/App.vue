<template>
  <main class="container">
    <aside class="container__aside">
      <section class="container__aside--top" @click="handleOpenLoginPage">
        <el-avatar size="small" :src="avatar" />
        <label class="ml8">{{ user ? `${user}` : '未登录' }}</label>
      </section>
      <el-menu
        v-if="menuVisible"
        text-color="rgb(126, 129, 142)"
        active-text-color="#e6a23c"
        :background-color="sidbarColor"
        class="container__aside--center"
        :default-active="pageName"
        :collapse="collapse"
        menu-trigger="click"
        @select="handleSelect"
      >
        <el-menu-item
          v-for="item in routeList"
          :index="item.name"
          :key="item.name"
        >
          <c-icon :icon="item.icon" />
          <span class="mr8">{{ item.label }}</span>
          <el-tag
            v-if="showHeaderTip(item)"
            round
            size="small"
            type="danger"
            effect="light"
          >
            生效中
          </el-tag>
        </el-menu-item>
      </el-menu>
      <section class="container__aside--bottom">
        <el-tooltip content="将当前配置复制到剪贴板">
          <el-link
            :underline="false"
            class="mr16"
            :icon="Upload"
            @click="handleCopyAllStorage"
          >
            导出
          </el-link>
        </el-tooltip>
        <el-tooltip content="导入他人配置">
          <el-link
            :underline="false"
            :icon="Download"
            @click="handleOpenDialog"
          >
            导入
          </el-link>
        </el-tooltip>
      </section>
      <import-dialog
        ref="importDialogRef"
        title="同步配置"
        @import-json="handlePasteAllStorage"
      />
    </aside>
    <article class="container__content">
      <router-view />
    </article>
  </main>
</template>
<script setup lang="ts">
import { Download, Upload } from '@element-plus/icons-vue';
import { ElMessage as Message, ElMessageBox as MessageBox } from 'element-plus';

import {
  BLACK_LIST,
  HOME,
  RECORDER,
  REQ_HEADER,
  RES_HEADER,
} from '@/const/router';
import api from '@/service';
import useCommonStore from '@/store/common';
import { copy } from '@/utils/index';
import { getCurrentStorage } from '@/utils/storage';

import {
  BLACKLIST_KEY,
  CURRENT_GROUP_ID_KEY,
  MOCK_GROUP_KEY,
  MOCK_INTERFACE_KEY,
  REQ_HEADER_KEY,
  RES_HEADER_KEY,
} from './const/storageKey';
import ImportDialog from './pages/detail/components/import-dialog.vue';

const routeList = [HOME, REQ_HEADER, RES_HEADER, RECORDER, BLACK_LIST];
const store = useCommonStore();
const route = useRoute();
const router = useRouter();
const pageName = ref<string>(route.name as string);
const collapse = ref(false);
const user = ref('');
const avatar = ref('');
const sidbarColor = ref('rgb(36,39,50)');
const importDialogRef = ref<InstanceType<typeof ImportDialog>>();
const menuVisible = computed(() => route.name);

const handleSelect = (name: string) => {
  pageName.value = name === 'detail' ? 'home' : name;
  router.push({ name });
};

const showHeaderTip = (route: typeof REQ_HEADER) => {
  if (route.name === REQ_HEADER.name) return store.hasReqHeaderProxy;
  if (route.name === RES_HEADER.name) return store.hasResHeaderProxy;
  return false;
};

const handleOpenLoginPage = () => {
  Message.warning('敬请期待');
};

const handleCopyAllStorage = () => {
  const result = copy(JSON.stringify(getCurrentStorage()));
  if (result) {
    return Message.success('复制成功');
  }
  Message.error('复制失败');
};

const handleOpenDialog = () => {
  importDialogRef.value?.handleOpen();
};

const handlePasteAllStorage = async (jsonStr: string) => {
  try {
    await MessageBox.confirm('确定同步这些配置吗？会覆盖当前本地配置', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
  } catch (err) {
    return;
  }

  try {
    const {
      [MOCK_GROUP_KEY]: mockGroup = [],
      [MOCK_INTERFACE_KEY]: table = [],
      [CURRENT_GROUP_ID_KEY]: currentGroupId = '',
      [BLACKLIST_KEY]: blacklist = [],
      [REQ_HEADER_KEY]: reqHeader = [],
      [RES_HEADER_KEY]: resHeader = [],
    } = JSON.parse(jsonStr);

    await Promise.all([
      Array.isArray(mockGroup) && api.group.update(mockGroup),
      Array.isArray(table) && api.mock.update(table),
      currentGroupId && api.currentGroupId.update(currentGroupId),
      Array.isArray(blacklist) && api.blacklist.update(blacklist),
      Array.isArray(reqHeader) && api.reqHeader.update(reqHeader),
      Array.isArray(resHeader) && api.resHeader.update(resHeader),
    ]);
    Message.success('同步成功');
    setTimeout(() => router.go(0), 1000);
  } catch (err: any) {
    Message.error(`同步失败，原因：${err.message}`);
  }
};

const syncUserInfo = async () => {
  // TODO 登录账号
};

watch(
  () => route.path,
  () => {
    handleSelect(route.name as string);
  }
);

onMounted(() => {
  store.updateReqHeader();
  store.updateResHeader();
});

syncUserInfo();
</script>
<style scoped lang="less">
.container {
  display: flex;
  width: 100%;
  height: 100%;
  &__aside {
    box-shadow: var(--el-box-shadow-dark);
    &:not(.el-menu--collapse) {
      width: 200px;
    }
    flex-shrink: 0;
    box-sizing: border-box;
    border-right: 1px solid @border;
    display: flex;
    flex-direction: column;
    background-color: v-bind(sidbarColor);
    color: #fff;
    &--top {
      cursor: pointer;
      display: flex;
      align-items: center;
      font-size: 12px;
      flex-shrink: 0;
      height: 50px;
      box-sizing: border-box;
      padding: 0 21px;
    }
    &--center {
      flex: 1;
      border-right: none;
      overflow-y: auto;
    }
    &--bottom {
      display: flex;
      justify-content: center;
      height: 40px;
      :deep(.el-link) {
        color: #fff;
      }
    }
    .aside__link {
      display: block;
      height: 40px;
      padding: 16px 8px 0 8px;
    }
  }
  &__content {
    flex: 1;
    overflow: hidden;
    padding: 16px;
    box-sizing: border-box;
    background-color: rgb(240, 244, 249);
  }
}
</style>
